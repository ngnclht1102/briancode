import type { MessageContent } from "./types.js";
/**
 * Convert internal multimodal content to Anthropic API format.
 * - TextContent → { type: "text", text: "..." }
 * - ImageContent → { type: "image", source: { type: "base64", media_type, data } }
 * - string → pass through as-is
 */
export declare function convertToAnthropicContent(content: MessageContent): unknown;
/**
 * Convert internal multimodal content to OpenAI API format.
 * - TextContent → { type: "text", text: "..." }
 * - ImageContent → { type: "image_url", image_url: { url: "data:mime;base64,data", detail: "auto" } }
 * - string → pass through as-is
 */
export declare function convertToOpenAIContent(content: MessageContent): unknown;
/**
 * Strip image blocks, return text only. For non-vision providers (e.g., DeepSeek).
 */
export declare function stripImages(content: MessageContent): string;
//# sourceMappingURL=message-converter.d.ts.map