import type { ChatMessage, MessageContent } from "../providers/types.js";
import { log } from "../logger.js";

/**
 * Context window sizes (in tokens) for known models.
 * Conservative estimates — leave room for output tokens.
 */
const MODEL_CONTEXT_WINDOWS: Record<string, number> = {
  // Anthropic
  "claude-sonnet-4-20250514": 200_000,
  "claude-opus-4-20250514": 200_000,
  "claude-haiku-3-5-20241022": 200_000,

  // DeepSeek
  "deepseek-chat": 64_000,
  "deepseek-coder": 64_000,
  "deepseek-reasoner": 64_000,

  // Kimi / Moonshot
  "moonshot-v1-auto": 128_000,
  "moonshot-v1-8k": 8_000,
  "moonshot-v1-16k": 16_000,
  "moonshot-v1-32k": 32_000,
  "moonshot-v1-64k": 64_000,
  "moonshot-v1-128k": 128_000,
  "kimi-latest": 128_000,
  "kimi-k2.5": 128_000,
  "kimi-k2-thinking": 128_000,
  "kimi-k2-thinking-turbo": 128_000,
  "kimi-k2-turbo-preview": 128_000,

  // Qwen
  "qwen-turbo": 128_000,
  "qwen-plus": 128_000,
  "qwen-max": 32_000,

  // Groq
  "llama-3.3-70b-versatile": 128_000,
  "llama-3.1-8b-instant": 128_000,
  "mixtral-8x7b-32768": 32_768,

  // Ollama defaults
  "llama3.2": 128_000,
};

const DEFAULT_CONTEXT_WINDOW = 64_000;
// Reserve tokens for the response
const OUTPUT_RESERVE = 8_192;
// Rough chars-per-token ratio (English text + code averages ~3.5 chars/token)
const CHARS_PER_TOKEN = 3.5;

/**
 * Estimate token count for a message content block.
 */
function estimateContentTokens(content: MessageContent): number {
  if (typeof content === "string") {
    return Math.ceil(content.length / CHARS_PER_TOKEN);
  }
  let total = 0;
  for (const block of content) {
    if (block.type === "text") {
      total += Math.ceil(block.text.length / CHARS_PER_TOKEN);
    } else if (block.type === "image") {
      total += 1500;
    }
  }
  return total;
}

/**
 * Estimate token count for a single message (content + tool call metadata).
 */
function estimateMessageTokens(msg: ChatMessage): number {
  let tokens = estimateContentTokens(msg.content);
  if (msg.tool_calls) {
    for (const tc of msg.tool_calls) {
      tokens += Math.ceil(tc.function.name.length / CHARS_PER_TOKEN);
      tokens += Math.ceil(tc.function.arguments.length / CHARS_PER_TOKEN);
      tokens += 20;
    }
  }
  tokens += 10;
  return tokens;
}

/**
 * Get the context window size for a model.
 */
export function getContextWindow(model: string): number {
  return MODEL_CONTEXT_WINDOWS[model] ?? DEFAULT_CONTEXT_WINDOW;
}

/**
 * Estimate total token count for a list of messages.
 */
export function estimateTotalTokens(messages: ChatMessage[]): number {
  let total = 0;
  for (const msg of messages) {
    total += estimateMessageTokens(msg);
  }
  return total;
}

/**
 * Truncate conversation history to fit within the model's context window.
 *
 * CRITICAL: Never drops messages from the current turn (last user message + its
 * tool call results). Only drops older turns. This prevents the model from
 * losing tool results it just received, which causes infinite re-read loops.
 *
 * @param messages - full conversation history
 * @param model - model name for context window lookup
 * @param currentTurnIndex - index in the full messages array where the current
 *   user turn starts. Messages from this index onward are NEVER dropped.
 */
export function truncateToFit(messages: ChatMessage[], model: string, currentTurnIndex?: number): ChatMessage[] {
  const contextWindow = getContextWindow(model);
  const maxInputTokens = contextWindow - OUTPUT_RESERVE;

  const totalTokens = estimateTotalTokens(messages);
  if (totalTokens <= maxInputTokens) {
    return messages; // fits fine
  }

  log.chat.warn(`Context too large: ~${totalTokens} tokens, limit ~${maxInputTokens} for ${model}. Truncating.`);

  // Separate system messages, old history, and current turn
  const systemMsgs: ChatMessage[] = [];
  const allNonSystem: ChatMessage[] = [];

  for (const m of messages) {
    if (m.role === "system") systemMsgs.push(m);
    else allNonSystem.push(m);
  }

  // Find the current turn boundary (last user message in non-system messages)
  let turnBoundary: number;
  if (currentTurnIndex !== undefined) {
    // Convert from full-messages index to non-system index
    turnBoundary = currentTurnIndex - systemMsgs.length;
    if (turnBoundary < 0) turnBoundary = 0;
  } else {
    turnBoundary = 0;
    for (let i = allNonSystem.length - 1; i >= 0; i--) {
      if (allNonSystem[i].role === "user") {
        turnBoundary = i;
        break;
      }
    }
  }

  const oldHistory = allNonSystem.slice(0, turnBoundary);
  const currentTurn = allNonSystem.slice(turnBoundary);

  const systemTokens = systemMsgs.reduce((sum, m) => sum + estimateMessageTokens(m), 0);
  const currentTurnTokens = currentTurn.reduce((sum, m) => sum + estimateMessageTokens(m), 0);

  // If current turn + system alone exceeds budget, truncate the user message
  if (systemTokens + currentTurnTokens > maxInputTokens) {
    log.chat.warn(`Current turn alone exceeds context (~${currentTurnTokens} tokens). Truncating user message.`);
    const truncatedTurn = truncateUserMessage(currentTurn, maxInputTokens - systemTokens);

    if (oldHistory.length > 0) {
      const marker: ChatMessage = {
        role: "system",
        content: `[Note: ${oldHistory.length} earlier messages and part of the current message were removed to fit the context window.]`,
      };
      return [...systemMsgs, marker, ...truncatedTurn];
    }
    return [...systemMsgs, ...truncatedTurn];
  }

  // Budget available for old history
  const budgetForOld = maxInputTokens - systemTokens - currentTurnTokens;

  if (budgetForOld <= 0 || oldHistory.length === 0) {
    // No room for old history
    if (oldHistory.length > 0) {
      const marker: ChatMessage = {
        role: "system",
        content: `[Note: ${oldHistory.length} earlier messages were removed to fit the context window.]`,
      };
      return [...systemMsgs, marker, ...currentTurn];
    }
    return [...systemMsgs, ...currentTurn];
  }

  // Keep as much old history as fits, from most recent backward
  const keptOld: ChatMessage[] = [];
  let usedTokens = 0;

  for (let i = oldHistory.length - 1; i >= 0; i--) {
    const msgTokens = estimateMessageTokens(oldHistory[i]);
    if (usedTokens + msgTokens > budgetForOld) break;
    keptOld.unshift(oldHistory[i]);
    usedTokens += msgTokens;
  }

  // Ensure old history starts on a user message
  while (keptOld.length > 0 && keptOld[0].role !== "user") {
    keptOld.shift();
  }

  const dropped = oldHistory.length - keptOld.length;
  if (dropped > 0) {
    log.chat.info(`Dropped ${dropped} oldest messages (kept ${keptOld.length} old + ${currentTurn.length} current turn)`);
    const marker: ChatMessage = {
      role: "system",
      content: `[Note: ${dropped} earlier messages were removed to fit the context window.]`,
    };
    return [...systemMsgs, marker, ...keptOld, ...currentTurn];
  }

  return [...systemMsgs, ...keptOld, ...currentTurn];
}

/**
 * Truncate the user message (first message in the turn) when it alone exceeds budget.
 * Keeps tool results intact — only truncates the user message content.
 */
function truncateUserMessage(turn: ChatMessage[], budget: number): ChatMessage[] {
  if (turn.length === 0) return turn;

  const userMsg = turn[0];
  const rest = turn.slice(1);
  const restTokens = rest.reduce((sum, m) => sum + estimateMessageTokens(m), 0);
  const userBudget = budget - restTokens - 100; // margin

  if (userBudget <= 0) return turn;

  const maxChars = Math.floor(userBudget * CHARS_PER_TOKEN);
  const content = typeof userMsg.content === "string"
    ? userMsg.content
    : userMsg.content.filter(b => b.type === "text").map(b => (b as { type: "text"; text: string }).text).join("\n");

  if (content.length <= maxChars) return turn;

  log.chat.warn(`Truncating user message from ${content.length} to ${maxChars} chars`);
  const truncated = content.slice(0, maxChars)
    + `\n\n... [Message truncated: original was ${content.length} chars, exceeds model context window. Use a model with a larger context or send a shorter message.]`;

  return [{ ...userMsg, content: truncated }, ...rest];
}
