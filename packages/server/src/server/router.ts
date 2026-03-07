import fs from "fs";
import os from "os";
import path from "path";
import type { FastifyInstance } from "fastify";
import { getSafeConfig, saveConfig, getRecentProjects, addRecentProject, removeRecentProject } from "../config.js";
import { switchProvider, getProvider } from "../providers/index.js";
import { getFileTree, setProjectRoot, getProjectRoot, invalidateCache, setFileChangeCallback } from "../context/workspace.js";
import { listConversations, loadConversation, deleteConversation, resetConversation, setActiveConversation } from "../history/history.js";
import { getChangeHistory, rollbackExecution, undoLast, clearChangeHistory } from "../executor/change-tracker.js";
import { resetChatState, loadChatMessages } from "./chat-handler.js";
import { broadcastMessage } from "./ws-handler.js";

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
    saveConfig(body);

    // If provider changed, switch immediately
    if (body.defaultProvider && typeof body.defaultProvider === "string") {
      try {
        switchProvider(body.defaultProvider);
      } catch {
        // provider may not have key yet
      }
    }

    return getSafeConfig();
  });

  app.post("/api/provider/switch", async (req) => {
    const { provider } = req.body as { provider: string };
    try {
      const p = switchProvider(provider);
      return { success: true, provider: p.name };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  app.get("/api/provider/current", async () => {
    try {
      const p = getProvider();
      return { provider: p.name };
    } catch {
      return { provider: null };
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

    try {
      const stat = fs.statSync(resolved);
      if (!stat.isDirectory()) {
        reply.status(400);
        return { success: false, error: "Path is not a directory" };
      }
    } catch {
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
    const deleted = deleteConversation(id);
    if (!deleted) {
      reply.status(404);
      return { success: false, error: "Conversation not found" };
    }
    return { success: true };
  });

  app.post("/api/conversation/load/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const conversation = loadConversation(id);
    if (!conversation) {
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
    resetChatState();
    return { success: true };
  });

  // Rollback / Undo
  app.get("/api/changes", async () => {
    return { changes: getChangeHistory() };
  });

  app.post("/api/rollback/:executionId", async (req) => {
    const { executionId } = req.params as { executionId: string };
    return rollbackExecution(executionId);
  });

  app.post("/api/undo", async () => {
    return undoLast();
  });
}
