import type { AIProvider, ChatMessage, StreamEvent, Tool } from "./types.js";
export declare class AnthropicProvider implements AIProvider {
    name: string;
    supportsVision: boolean;
    private apiKey;
    private model;
    private baseUrl;
    constructor(options: {
        apiKey: string;
        model?: string;
        baseUrl?: string;
    });
    chat(messages: ChatMessage[], tools?: Tool[]): AsyncIterable<StreamEvent>;
}
//# sourceMappingURL=anthropic.d.ts.map