import { getProvider } from "../providers/index.js";
import { getToolDefinitions, executeTool, resetToolExecutionState } from "../context/tool-handler.js";
import { buildSystemPrompt } from "../context/context-builder.js";
import { addMessageToHistory, getCurrentConversationId, resetConversation } from "../history/history.js";
import { readFileRaw } from "../context/file-reader.js";
import { log } from "../logger.js";
const MAX_TOOL_ITERATIONS = 25;
const conversationHistory = [];
let systemPromptLoaded = false;
let abortController = null;
export function resetChatState() {
    log.chat.info("Chat state reset");
    conversationHistory.length = 0;
    systemPromptLoaded = false;
    resetConversation();
}
export function loadChatMessages(messages) {
    conversationHistory.length = 0;
    conversationHistory.push(...messages);
    systemPromptLoaded = messages.some((m) => m.role === "system");
    log.chat.info(`Loaded ${messages.length} messages from history`);
}
export function cancelChat() {
    if (abortController) {
        log.chat.info("Chat generation cancelled");
        abortController.abort();
        abortController = null;
    }
}
/**
 * Delete messages from conversation history starting at the given index.
 * Index is relative to non-system messages (0 = first user message).
 * Deletes the message at that index and all messages after it.
 */
export function deleteMessagesFrom(messageIndex) {
    const systemCount = conversationHistory.filter((m) => m.role === "system").length;
    const targetIndex = systemCount + messageIndex;
    if (targetIndex >= 0 && targetIndex < conversationHistory.length) {
        const removed = conversationHistory.length - targetIndex;
        conversationHistory.splice(targetIndex);
        log.chat.info(`Deleted ${removed} messages from index ${messageIndex}`);
    }
}
/**
 * Get the last user message content for regeneration.
 * Removes everything from the last user message onwards.
 */
export function popLastAssistantTurn() {
    let lastUserIdx = -1;
    for (let i = conversationHistory.length - 1; i >= 0; i--) {
        if (conversationHistory[i].role === "user") {
            lastUserIdx = i;
            break;
        }
    }
    if (lastUserIdx === -1)
        return null;
    const content = conversationHistory[lastUserIdx].content;
    const userMessage = typeof content === "string" ? content : content.filter(b => b.type === "text").map(b => b.text).join("\n");
    conversationHistory.splice(lastUserIdx);
    log.chat.info(`Popped last assistant turn, resending: "${userMessage.slice(0, 80)}..."`);
    return userMessage;
}
export async function chatHandler(socket, message, attachments) {
    log.chat.start(`Chat request: "${message.slice(0, 100)}${message.length > 100 ? "..." : ""}"`);
    if (!systemPromptLoaded) {
        log.chat.info("Building system prompt...");
        const basePrompt = await buildSystemPrompt();
        conversationHistory.unshift({ role: "system", content: basePrompt });
        systemPromptLoaded = true;
        log.chat.done(`System prompt built (${basePrompt.length} chars)`);
    }
    resetToolExecutionState();
    abortController = new AbortController();
    const signal = abortController.signal;
    // Process attachments into the user message
    let userContent = message;
    if (attachments && attachments.length > 0) {
        const textParts = [];
        const imageBlocks = [];
        for (const att of attachments) {
            if (att.type === "file_mention" && att.path) {
                const content = readFileRaw(att.path);
                textParts.push(`--- File: ${att.path} ---\n${content}\n---`);
            }
            else if (att.type === "document" && att.content) {
                textParts.push(`--- Document: ${att.filename ?? "unknown"} ---\n${att.content}\n---`);
            }
            else if (att.type === "image" && att.data && att.mimeType) {
                imageBlocks.push({ type: "image", mimeType: att.mimeType, data: att.data });
            }
        }
        const composedText = textParts.length > 0
            ? `<attachments>\n${textParts.join("\n\n")}\n</attachments>\n\n<user_message>\n${message}\n</user_message>`
            : message;
        if (imageBlocks.length > 0) {
            userContent = [
                { type: "text", text: composedText },
                ...imageBlocks,
            ];
        }
        else {
            userContent = composedText;
        }
    }
    conversationHistory.push({ role: "user", content: userContent });
    addMessageToHistory("user", message);
    const provider = getProvider();
    const tools = getToolDefinitions();
    log.chat.info(`Using provider: ${provider.name}`);
    try {
        let iterations = 0;
        while (iterations < MAX_TOOL_ITERATIONS) {
            if (signal.aborted)
                break;
            iterations++;
            log.chat.info(`Iteration ${iterations}/${MAX_TOOL_ITERATIONS}`);
            const stream = provider.chat(conversationHistory, tools);
            let fullText = "";
            const toolCalls = [];
            for await (const event of stream) {
                if (signal.aborted)
                    break;
                if (event.type === "text_delta") {
                    fullText += event.content;
                    socket.send(JSON.stringify({ type: "chat:stream", delta: event.content }));
                }
                else if (event.type === "tool_call") {
                    toolCalls.push({ id: event.id, name: event.name, args: event.args });
                }
            }
            if (signal.aborted) {
                log.chat.info("Chat aborted during stream");
                if (fullText) {
                    conversationHistory.push({ role: "assistant", content: fullText });
                    addMessageToHistory("assistant", fullText);
                }
                break;
            }
            if (toolCalls.length === 0) {
                if (fullText) {
                    conversationHistory.push({ role: "assistant", content: fullText });
                    addMessageToHistory("assistant", fullText);
                }
                log.chat.done(`Chat completed (${iterations} iterations, ${fullText.length} chars)`);
                const convId = getCurrentConversationId();
                socket.send(JSON.stringify({ type: "chat:done", conversationId: convId }));
                return;
            }
            log.chat.info(`${toolCalls.length} tool call(s) requested`);
            conversationHistory.push({
                role: "assistant",
                content: fullText || "",
                tool_calls: toolCalls.map((tc) => ({
                    id: tc.id,
                    type: "function",
                    function: { name: tc.name, arguments: JSON.stringify(tc.args) },
                })),
            });
            if (fullText) {
                addMessageToHistory("assistant", fullText);
            }
            for (const tc of toolCalls) {
                if (signal.aborted)
                    break;
                log.tool.start(`${tc.name}`, tc.args);
                socket.send(JSON.stringify({
                    type: "chat:tool_call",
                    toolCallId: tc.id,
                    name: tc.name,
                    args: tc.args,
                }));
                const result = await executeTool(tc.name, tc.args);
                log.tool.done(`${tc.name} (${result.length} chars)`);
                socket.send(JSON.stringify({
                    type: "chat:tool_result",
                    toolCallId: tc.id,
                    name: tc.name,
                    result: result.length > 2000 ? result.slice(0, 2000) + "\n... (truncated)" : result,
                }));
                conversationHistory.push({
                    role: "tool",
                    content: result,
                    tool_call_id: tc.id,
                });
                addMessageToHistory("tool", result, [{ name: tc.name }]);
            }
        }
        if (signal.aborted) {
            log.chat.info("Chat stopped by user");
            socket.send(JSON.stringify({ type: "chat:stream", delta: "\n\n[Generation stopped]" }));
        }
        else if (iterations >= MAX_TOOL_ITERATIONS) {
            log.chat.warn(`Max tool iterations reached (${MAX_TOOL_ITERATIONS})`);
            socket.send(JSON.stringify({
                type: "chat:stream",
                delta: "\n\n[Reached maximum tool call iterations]",
            }));
        }
        const convId = getCurrentConversationId();
        socket.send(JSON.stringify({ type: "chat:done", conversationId: convId }));
    }
    catch (err) {
        log.chat.error(`Provider error: ${String(err)}`);
        if (!signal.aborted) {
            socket.send(JSON.stringify({ type: "error", message: `Provider error: ${String(err)}` }));
        }
        else {
            const convId = getCurrentConversationId();
            socket.send(JSON.stringify({ type: "chat:done", conversationId: convId }));
        }
    }
    finally {
        abortController = null;
    }
}
//# sourceMappingURL=chat-handler.js.map