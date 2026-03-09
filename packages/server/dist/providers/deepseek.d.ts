import { OpenAICompatProvider } from "./openai-compat.js";
import type { ChatMessage, StreamEvent, Tool } from "./types.js";
export declare class DeepSeekProvider extends OpenAICompatProvider {
    supportsVision: boolean;
    constructor(options: {
        apiKey: string;
        model?: string;
        baseUrl?: string;
    });
    chat(messages: ChatMessage[], tools?: Tool[]): AsyncIterable<StreamEvent>;
}
//# sourceMappingURL=deepseek.d.ts.map