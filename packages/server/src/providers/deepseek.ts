import { OpenAICompatProvider } from "./openai-compat.js";

export class DeepSeekProvider extends OpenAICompatProvider {
  constructor(options: { apiKey: string; model?: string; baseUrl?: string }) {
    super({
      name: "deepseek",
      apiKey: options.apiKey,
      model: options.model ?? "deepseek-chat",
      baseUrl: options.baseUrl ?? "https://api.deepseek.com",
    });
  }
}
