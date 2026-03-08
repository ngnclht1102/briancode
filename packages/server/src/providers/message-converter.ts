import type { MessageContent } from "./types.js";

/**
 * Convert internal multimodal content to Anthropic API format.
 * - TextContent → { type: "text", text: "..." }
 * - ImageContent → { type: "image", source: { type: "base64", media_type, data } }
 * - string → pass through as-is
 */
export function convertToAnthropicContent(content: MessageContent): unknown {
  if (typeof content === "string") return content;
  return content.map((block) => {
    if (block.type === "text") {
      return { type: "text", text: block.text };
    }
    // block.type === "image"
    return {
      type: "image",
      source: {
        type: "base64",
        media_type: block.mimeType,
        data: block.data,
      },
    };
  });
}

/**
 * Convert internal multimodal content to OpenAI API format.
 * - TextContent → { type: "text", text: "..." }
 * - ImageContent → { type: "image_url", image_url: { url: "data:mime;base64,data", detail: "auto" } }
 * - string → pass through as-is
 */
export function convertToOpenAIContent(content: MessageContent): unknown {
  if (typeof content === "string") return content;
  return content.map((block) => {
    if (block.type === "text") {
      return { type: "text", text: block.text };
    }
    return {
      type: "image_url",
      image_url: {
        url: `data:${block.mimeType};base64,${block.data}`,
        detail: "auto",
      },
    };
  });
}

/**
 * Strip image blocks, return text only. For non-vision providers (e.g., DeepSeek).
 */
export function stripImages(content: MessageContent): string {
  if (typeof content === "string") return content;
  const textParts: string[] = [];
  for (const block of content) {
    if (block.type === "text") {
      textParts.push(block.text);
    } else {
      textParts.push("[Image attached — this model does not support image analysis]");
    }
  }
  return textParts.join("\n");
}
