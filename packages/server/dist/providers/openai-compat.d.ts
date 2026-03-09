import type { AIProvider, ChatMessage, StreamEvent, Tool } from "./types.js";
export interface OpenAICompatOptions {
    name: string;
    apiKey: string;
    model: string;
    baseUrl: string;
}
export declare class OpenAICompatProvider implements AIProvider {
    name: string;
    supportsVision: boolean;
    private apiKey;
    private model;
    private baseUrl;
    constructor(options: OpenAICompatOptions);
    chat(messages: ChatMessage[], tools?: Tool[]): AsyncIterable<StreamEvent>;
}
export declare const PROVIDER_PRESETS: Record<string, {
    baseUrl: string;
    defaultModel: string;
}>;
//# sourceMappingURL=openai-compat.d.ts.map