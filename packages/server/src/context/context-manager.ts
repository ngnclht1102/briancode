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
  "moonshot-v1-8k": 8_000,
  "moonshot-v1-16k": 16_000,
  "moonshot-v1-32k": 32_000,
  "moonshot-v1-64k": 64_000,
  "moonshot-v1-128k": 128_000,
  "kimi-latest": 128_000,

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
      // Images typically cost ~1000-2000 tokens depending on size
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
  // Tool call metadata
  if (msg.tool_calls) {
    for (const tc of msg.tool_calls) {
      tokens += Math.ceil(tc.function.name.length / CHARS_PER_TOKEN);
      tokens += Math.ceil(tc.function.arguments.length / CHARS_PER_TOKEN);
      tokens += 20; // overhead per tool call
    }
  }
  // Per-message overhead (role, formatting)
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
 * Strategy:
 * 1. Always keep system messages (at the start)
 * 2. Always keep the last user message + recent context
 * 3. Drop oldest non-system messages first
 * 4. When dropping, remove complete "turns" (user + assistant + tool results)
 *
 * Returns a new array (does not mutate input).
 */
export function truncateToFit(messages: ChatMessage[], model: string): ChatMessage[] {
  const contextWindow = getContextWindow(model);
  const maxInputTokens = contextWindow - OUTPUT_RESERVE;

  const totalTokens = estimateTotalTokens(messages);
  if (totalTokens <= maxInputTokens) {
    return messages; // fits fine
  }

  log.chat.warn(`Context too large: ~${totalTokens} tokens, limit ~${maxInputTokens} for ${model}. Truncating.`);

  // Separate system messages from the rest
  const systemMsgs = messages.filter(m => m.role === "system");
  const nonSystemMsgs = messages.filter(m => m.role !== "system");

  const systemTokens = systemMsgs.reduce((sum, m) => sum + estimateMessageTokens(m), 0);
  const budget = maxInputTokens - systemTokens;

  if (budget <= 0) {
    // System prompt alone exceeds limit — just keep system + last user message
    log.chat.warn("System prompt alone exceeds context budget");
    const lastUser = nonSystemMsgs.filter(m => m.role === "user").pop();
    return lastUser ? [...systemMsgs, lastUser] : [...systemMsgs];
  }

  // Walk from the end backwards, accumulating messages until we fill the budget
  const kept: ChatMessage[] = [];
  let usedTokens = 0;

  for (let i = nonSystemMsgs.length - 1; i >= 0; i--) {
    const msgTokens = estimateMessageTokens(nonSystemMsgs[i]);
    if (usedTokens + msgTokens > budget) break;
    kept.unshift(nonSystemMsgs[i]);
    usedTokens += msgTokens;
  }

  // Make sure we start on a user message (not a dangling tool result or assistant)
  while (kept.length > 0 && kept[0].role !== "user") {
    kept.shift();
  }

  const dropped = nonSystemMsgs.length - kept.length;
  if (dropped > 0) {
    log.chat.info(`Dropped ${dropped} oldest messages to fit context (kept ${kept.length}, ~${usedTokens} tokens)`);

    // Add a summary marker so the model knows context was truncated
    const marker: ChatMessage = {
      role: "system",
      content: `[Note: ${dropped} earlier messages were removed to fit the context window. The conversation continues from the most recent messages below.]`,
    };
    return [...systemMsgs, marker, ...kept];
  }

  return [...systemMsgs, ...kept];
}
