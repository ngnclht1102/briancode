import { OpenAICompatProvider } from "./openai-compat.js";
import { stripImages } from "./message-converter.js";
import type { ChatMessage, StreamEvent, Tool } from "./types.js";

export class DeepSeekProvider extends OpenAICompatProvider {
  override supportsVision = false;

  constructor(options: { apiKey: string; model?: string; baseUrl?: string }) {
    super({
      name: "deepseek",
      apiKey: options.apiKey,
      model: options.model ?? "deepseek-chat",
      baseUrl: options.baseUrl ?? "https://api.deepseek.com",
    });
  }

  override async *chat(messages: ChatMessage[], tools?: Tool[]): AsyncIterable<StreamEvent> {
    // Strip images since DeepSeek doesn't support vision
    const sanitized = messages.map((msg) => ({
      ...msg,
      content: stripImages(msg.content),
    }));
    yield* super.chat(sanitized, tools);
  }
}
