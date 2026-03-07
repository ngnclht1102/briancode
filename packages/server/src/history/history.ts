import fs from "fs";
import path from "path";
import os from "os";
import { getProjectRoot } from "../context/workspace.js";

const HISTORY_DIR = path.join(os.homedir(), ".brian-code", "history");
const MAX_CONVERSATIONS = 50;

export interface ConversationEntry {
  id: string;
  projectPath: string;
  projectName: string;
  startedAt: string;
  title: string;
  messageCount: number;
}

export interface Conversation {
  id: string;
  projectPath: string;
  startedAt: string;
  title: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp: number;
    toolCalls?: Array<{ name: string; args: Record<string, unknown> }>;
  }>;
}

function ensureDir() {
  if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
  }
}

function isValidId(id: string): boolean {
  return /^conv-\d+$/.test(id);
}

let currentConversation: Conversation | null = null;

export function getCurrentConversationId(): string | null {
  return currentConversation?.id ?? null;
}

export function startConversation(): Conversation {
  const id = `conv-${Date.now()}`;
  currentConversation = {
    id,
    projectPath: getProjectRoot(),
    startedAt: new Date().toISOString(),
    title: "New Chat",
    messages: [],
  };
  return currentConversation;
}

export function addMessageToHistory(role: string, content: string, toolCalls?: Array<{ name: string }>) {
  if (!currentConversation) startConversation();
  currentConversation!.messages.push({
    role,
    content: role === "tool" ? content.slice(0, 200) : content,
    timestamp: Date.now(),
    toolCalls: toolCalls as Array<{ name: string; args: Record<string, unknown> }>,
  });

  if (role === "user" && currentConversation!.title === "New Chat") {
    currentConversation!.title = content.slice(0, 80);
  }

  saveCurrentConversation();
}

function saveCurrentConversation() {
  if (!currentConversation) return;
  ensureDir();
  const filePath = path.join(HISTORY_DIR, `${currentConversation.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(currentConversation, null, 2));
  pruneOldConversations();
}

export function listConversations(filterProjectPath?: string): ConversationEntry[] {
  ensureDir();
  const files = fs.readdirSync(HISTORY_DIR).filter((f) => f.endsWith(".json")).sort().reverse();
  const entries: ConversationEntry[] = [];

  for (const file of files.slice(0, MAX_CONVERSATIONS)) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(HISTORY_DIR, file), "utf-8"));
      if (filterProjectPath && data.projectPath !== filterProjectPath) continue;
      entries.push({
        id: data.id,
        projectPath: data.projectPath,
        projectName: path.basename(data.projectPath ?? ""),
        startedAt: data.startedAt,
        title: data.title,
        messageCount: data.messages?.length ?? 0,
      });
    } catch {
      // skip corrupt files
    }
  }

  return entries;
}

export function loadConversation(id: string): Conversation | null {
  if (!isValidId(id)) return null;
  const filePath = path.join(HISTORY_DIR, `${id}.json`);
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

export function deleteConversation(id: string): boolean {
  if (!isValidId(id)) return false;
  const filePath = path.join(HISTORY_DIR, `${id}.json`);
  try {
    if (!fs.existsSync(filePath)) return false;
    fs.unlinkSync(filePath);
    if (currentConversation?.id === id) {
      currentConversation = null;
    }
    return true;
  } catch {
    return false;
  }
}

export function setActiveConversation(conversation: Conversation) {
  currentConversation = conversation;
}

export function resetConversation() {
  currentConversation = null;
}

function pruneOldConversations() {
  ensureDir();
  const files = fs.readdirSync(HISTORY_DIR).filter((f) => f.endsWith(".json")).sort();
  while (files.length > MAX_CONVERSATIONS) {
    const oldest = files.shift()!;
    try {
      fs.unlinkSync(path.join(HISTORY_DIR, oldest));
    } catch {}
  }
}
