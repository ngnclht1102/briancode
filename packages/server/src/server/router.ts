import fs from "fs";
import os from "os";
import path from "path";
import type { FastifyInstance } from "fastify";
import { getSafeConfig, saveConfig, getRecentProjects, addRecentProject, removeRecentProject } from "../config.js";
import { switchProvider, getProvider, switchModel, getCurrentModel } from "../providers/index.js";
import { getFileTree, setProjectRoot, getProjectRoot, invalidateCache, setFileChangeCallback } from "../context/workspace.js";
import { listConversations, loadConversation, deleteConversation, resetConversation, setActiveConversation } from "../history/history.js";
import { getChangeHistory, rollbackExecution, undoLast, clearChangeHistory } from "../executor/change-tracker.js";
import { readFileRaw } from "../context/file-reader.js";
import { resetChatState, loadChatMessages } from "./chat-handler.js";
import { broadcastMessage } from "./ws-handler.js";
import { registerUploadRoute } from "./upload-handler.js";
import { log, getRecentLogs } from "../logger.js";
import { estimateTotalTokens, getContextWindow } from "../context/context-manager.js";
import { getCurrentModel } from "../providers/index.js";

function resolvePath(input: string): string {
  if (input.startsWith("~")) {
    return path.resolve(os.homedir(), input.slice(2));
  }
  return path.resolve(input);
}

export function registerRoutes(app: FastifyInstance) {
  // Start file watcher — broadcast changes to all clients
  setFileChangeCallback(() => {
    broadcastMessage({ type: "files:changed" });
  });
  // Initialize watcher for initial project root
  setProjectRoot(getProjectRoot());

  app.get("/api/health", async () => {
    return { status: "ok" };
  });

  app.get("/api/config", async () => {
    return getSafeConfig();
  });

  app.post("/api/config", async (req) => {
    const body = req.body as Record<string, unknown>;
    log.router.info("Config updated");
    saveConfig(body);

    // Recreate active provider to pick up any config changes (baseUrl, model, key)
    const config = getSafeConfig();
    try {
      switchProvider(
        (body.defaultProvider as string) ?? config.defaultProvider,
      );
    } catch {
      // provider may not have key yet
    }

    return config;
  });

  app.post("/api/provider/switch", async (req) => {
    const { provider } = req.body as { provider: string };
    log.router.info(`Provider switch request: ${provider}`);
    try {
      const p = switchProvider(provider);
      log.router.done(`Provider switched to: ${p.name}`);
      return { success: true, provider: p.name, supportsVision: p.supportsVision ?? false };
    } catch (err) {
      log.router.error(`Provider switch failed: ${String(err)}`);
      return { success: false, error: String(err) };
    }
  });

  app.get("/api/provider/current", async () => {
    try {
      const p = getProvider();
      return { provider: p.name, model: getCurrentModel(), supportsVision: p.supportsVision ?? false };
    } catch {
      return { provider: null, model: null, supportsVision: false };
    }
  });

  app.post("/api/provider/model", async (req) => {
    const { model } = req.body as { model: string };
    log.router.info(`Model switch request: ${model}`);
    try {
      const p = switchModel(model);
      saveConfig({ providers: { [p.name]: { model } } });
      log.router.done(`Model switched to: ${model}`);
      return { success: true, provider: p.name, model, supportsVision: p.supportsVision ?? false };
    } catch (err) {
      log.router.error(`Model switch failed: ${String(err)}`);
      return { success: false, error: String(err) };
    }
  });

  // Project endpoints
  app.get("/api/project/current", async () => {
    const projectPath = getProjectRoot();
    return { path: projectPath, name: path.basename(projectPath) };
  });

  app.post("/api/project/switch", async (req, reply) => {
    const { path: inputPath } = req.body as { path?: string };
    if (!inputPath || typeof inputPath !== "string") {
      reply.status(400);
      return { success: false, error: "Path is required" };
    }

    const resolved = resolvePath(inputPath.trim());
    log.router.info(`Project switch request: ${resolved}`);

    try {
      const stat = fs.statSync(resolved);
      if (!stat.isDirectory()) {
        log.router.error(`Not a directory: ${resolved}`);
        reply.status(400);
        return { success: false, error: "Path is not a directory" };
      }
    } catch {
      log.router.error(`Directory not found: ${resolved}`);
      reply.status(400);
      return { success: false, error: "Directory not found" };
    }

    // Switch project
    setProjectRoot(resolved);
    invalidateCache();
    clearChangeHistory();
    resetChatState();
    addRecentProject(resolved);

    const name = path.basename(resolved);
    broadcastMessage({ type: "project:switched", path: resolved, name });
    log.router.done(`Project switched to: ${name} (${resolved})`);

    return { success: true, path: resolved, name };
  });

  app.get("/api/project/recent", async () => {
    const projects = getRecentProjects().map((p) => ({
      ...p,
      exists: fs.existsSync(p.path),
    }));
    return { projects };
  });

  app.post("/api/project/recent/remove", async (req) => {
    const { path: projectPath } = req.body as { path?: string };
    if (projectPath) {
      removeRecentProject(projectPath);
    }
    return { success: true };
  });

  // File tree
  app.get("/api/files", async () => {
    const tree = await getFileTree();
    return { files: tree };
  });

  // Read single file content (for code viewer)
  app.get("/api/file/*", async (req, reply) => {
    const filePath = (req.params as Record<string, string>)["*"];
    if (!filePath) {
      reply.status(400);
      return { error: "File path required" };
    }
    const content = readFileRaw(filePath, 500_000);
    if (content.startsWith("Error:")) {
      reply.status(404);
      return { error: content };
    }
    return { path: filePath, content };
  });

  // Conversation history
  app.get("/api/history", async (req) => {
    const { project } = req.query as { project?: string };
    const filterPath = project || getProjectRoot();
    return { conversations: listConversations(filterPath) };
  });

  app.get("/api/history/:id", async (req) => {
    const { id } = req.params as { id: string };
    const conversation = loadConversation(id);
    if (!conversation) return { error: "Not found" };
    return conversation;
  });

  app.delete("/api/history/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    log.router.info(`Delete conversation: ${id}`);
    const deleted = deleteConversation(id);
    if (!deleted) {
      reply.status(404);
      return { success: false, error: "Conversation not found" };
    }
    return { success: true };
  });

  app.post("/api/conversation/load/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    log.router.info(`Load conversation: ${id}`);
    const conversation = loadConversation(id);
    if (!conversation) {
      log.router.error(`Conversation not found: ${id}`);
      reply.status(404);
      return { success: false, error: "Conversation not found" };
    }
    setActiveConversation(conversation);
    // Rebuild chat messages for the AI context
    const chatMessages = conversation.messages
      .filter((m) => m.role === "user" || m.role === "assistant" || m.role === "system")
      .map((m) => ({ role: m.role as "user" | "assistant" | "system", content: m.content }));
    loadChatMessages(chatMessages);
    return { success: true, conversation };
  });

  app.post("/api/conversation/new", async () => {
    log.router.info("New conversation");
    resetChatState();
    return { success: true };
  });

  // Rollback / Undo
  app.get("/api/changes", async () => {
    return { changes: getChangeHistory() };
  });

  app.post("/api/rollback/:executionId", async (req) => {
    const { executionId } = req.params as { executionId: string };
    log.router.info(`Rollback execution: ${executionId}`);
    const result = rollbackExecution(executionId);
    log.router.done(`Rollback: ${result.restored.length} restored, ${result.errors.length} errors`);
    return result;
  });

  app.post("/api/undo", async () => {
    log.router.info("Undo last change");
    return undoLast();
  });

  // Context usage info
  app.get("/api/context", async () => {
    const { getConversationSnapshot: getHistory } = await import("./chat-handler.js");
    // Re-import to get the raw messages for token counting
    const { conversationHistory } = await import("./chat-handler.js");
    const model = getCurrentModel() ?? "unknown";
    const contextWindow = getContextWindow(model);
    const usedTokens = estimateTotalTokens(conversationHistory);
    return {
      model,
      contextWindow,
      usedTokens,
      usagePercent: Math.round((usedTokens / contextWindow) * 100),
      messageCount: conversationHistory.length,
    };
  });

  // Bug report — collects conversation + context and forwards to proxy
  app.post("/api/bug-report", async (req) => {
    const body = req.body as { description?: string };
    const config = getSafeConfig();

    // Get conversation messages from chat handler
    const { getConversationSnapshot } = await import("./chat-handler.js");
    const messages = getConversationSnapshot();

    const report = {
      description: body.description ?? "",
      provider: config.defaultProvider,
      model: config.providers[config.defaultProvider]?.model ?? "unknown",
      project: getProjectRoot(),
      messages,
      serverLogs: getRecentLogs(),
    };

    // Forward to proxy bug endpoint
    const proxyBaseUrl = config.providers[config.defaultProvider]?.baseUrl;
    // Derive proxy host from any configured baseUrl (they all point to the same proxy)
    let proxyUrl = "";
    for (const prov of Object.values(config.providers)) {
      if (prov.baseUrl && prov.baseUrl.includes("3100")) {
        const url = new URL(prov.baseUrl);
        proxyUrl = `${url.protocol}//${url.host}/bugs`;
        break;
      }
    }

    if (!proxyUrl) {
      // No proxy configured, save locally
      const savePath = path.join(os.homedir(), ".brian-code", "bugs");
      const fs = await import("fs");
      fs.mkdirSync(savePath, { recursive: true });
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `bug-${timestamp}.txt`;
      const lines = [
        `Bug Report — ${new Date().toISOString()}`,
        "=".repeat(60),
        "",
        `Provider: ${report.provider}`,
        `Model: ${report.model}`,
        `Project: ${report.project}`,
        "",
        "--- User Description ---",
        report.description || "(no description)",
        "",
        "--- Conversation ---",
      ];
      for (const msg of messages) {
        lines.push("");
        lines.push(`[${msg.role}] (${new Date(msg.timestamp).toLocaleString()})`);
        lines.push(msg.content ?? "");
      }
      lines.push("", "--- End of Report ---");
      fs.writeFileSync(path.join(savePath, filename), lines.join("\n"), "utf-8");
      log.router.done(`Bug report saved locally: ${filename}`);
      return { success: true, filename, location: "local" };
    }

    try {
      const res = await fetch(proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });
      const data = await res.json() as { success?: boolean; filename?: string };
      log.router.done(`Bug report forwarded to proxy: ${data.filename}`);
      return { success: true, filename: data.filename, location: "proxy" };
    } catch (err) {
      log.router.error(`Failed to forward bug report: ${String(err)}`);
      return { success: false, error: "Failed to send bug report to proxy" };
    }
  });

  registerUploadRoute(app);
}
