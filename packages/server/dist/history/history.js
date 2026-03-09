import fs from "fs";
import path from "path";
import os from "os";
import { getProjectRoot } from "../context/workspace.js";
import { log } from "../logger.js";
const HISTORY_DIR = path.join(os.homedir(), ".brian-code", "history");
const MAX_CONVERSATIONS = 50;
function ensureDir() {
    if (!fs.existsSync(HISTORY_DIR)) {
        fs.mkdirSync(HISTORY_DIR, { recursive: true });
    }
}
function isValidId(id) {
    return /^conv-\d+$/.test(id);
}
let currentConversation = null;
export function getCurrentConversationId() {
    return currentConversation?.id ?? null;
}
export function startConversation() {
    const id = `conv-${Date.now()}`;
    currentConversation = {
        id,
        projectPath: getProjectRoot(),
        startedAt: new Date().toISOString(),
        title: "New Chat",
        messages: [],
    };
    log.history.start(`New conversation: ${id}`);
    return currentConversation;
}
export function addMessageToHistory(role, content, toolCalls) {
    if (!currentConversation)
        startConversation();
    currentConversation.messages.push({
        role,
        content: role === "tool" ? content.slice(0, 200) : content,
        timestamp: Date.now(),
        toolCalls: toolCalls,
    });
    if (role === "user" && currentConversation.title === "New Chat") {
        currentConversation.title = content.slice(0, 80);
    }
    saveCurrentConversation();
}
function saveCurrentConversation() {
    if (!currentConversation)
        return;
    ensureDir();
    const filePath = path.join(HISTORY_DIR, `${currentConversation.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(currentConversation, null, 2));
    pruneOldConversations();
}
export function listConversations(filterProjectPath) {
    ensureDir();
    const files = fs.readdirSync(HISTORY_DIR).filter((f) => f.endsWith(".json")).sort().reverse();
    const entries = [];
    for (const file of files.slice(0, MAX_CONVERSATIONS)) {
        try {
            const data = JSON.parse(fs.readFileSync(path.join(HISTORY_DIR, file), "utf-8"));
            if (filterProjectPath && data.projectPath !== filterProjectPath)
                continue;
            entries.push({
                id: data.id,
                projectPath: data.projectPath,
                projectName: path.basename(data.projectPath ?? ""),
                startedAt: data.startedAt,
                title: data.title,
                messageCount: data.messages?.length ?? 0,
            });
        }
        catch {
            // skip corrupt files
        }
    }
    return entries;
}
export function loadConversation(id) {
    if (!isValidId(id))
        return null;
    const filePath = path.join(HISTORY_DIR, `${id}.json`);
    try {
        const conv = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        log.history.info(`Loaded conversation: ${id} (${conv.messages?.length ?? 0} messages)`);
        return conv;
    }
    catch {
        log.history.error(`Failed to load conversation: ${id}`);
        return null;
    }
}
export function deleteConversation(id) {
    if (!isValidId(id))
        return false;
    const filePath = path.join(HISTORY_DIR, `${id}.json`);
    try {
        if (!fs.existsSync(filePath))
            return false;
        fs.unlinkSync(filePath);
        if (currentConversation?.id === id) {
            currentConversation = null;
        }
        log.history.info(`Deleted conversation: ${id}`);
        return true;
    }
    catch {
        log.history.error(`Failed to delete conversation: ${id}`);
        return false;
    }
}
export function setActiveConversation(conversation) {
    currentConversation = conversation;
}
export function resetConversation() {
    currentConversation = null;
}
function pruneOldConversations() {
    ensureDir();
    const files = fs.readdirSync(HISTORY_DIR).filter((f) => f.endsWith(".json")).sort();
    while (files.length > MAX_CONVERSATIONS) {
        const oldest = files.shift();
        try {
            fs.unlinkSync(path.join(HISTORY_DIR, oldest));
        }
        catch { }
    }
}
//# sourceMappingURL=history.js.map