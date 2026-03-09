import { OpenAICompatProvider } from "./openai-compat.js";
import { stripImages } from "./message-converter.js";
export class DeepSeekProvider extends OpenAICompatProvider {
    supportsVision = false;
    constructor(options) {
        super({
            name: "deepseek",
            apiKey: options.apiKey,
            model: options.model ?? "deepseek-chat",
            baseUrl: options.baseUrl ?? "https://api.deepseek.com",
        });
    }
    async *chat(messages, tools) {
        // Strip images since DeepSeek doesn't support vision
        const sanitized = messages.map((msg) => ({
            ...msg,
            content: stripImages(msg.content),
        }));
        yield* super.chat(sanitized, tools);
    }
}
//# sourceMappingURL=deepseek.js.map