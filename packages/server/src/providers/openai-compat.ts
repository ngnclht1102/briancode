import type { AIProvider, ChatMessage, StreamEvent, Tool } from "./types.js";
import { convertToOpenAIContent } from "./message-converter.js";
import { log } from "../logger.js";

export interface OpenAICompatOptions {
  name: string;
  apiKey: string;
  model: string;
  baseUrl: string;
}

export class OpenAICompatProvider implements AIProvider {
  name: string;
  supportsVision = true;
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(options: OpenAICompatOptions) {
    this.name = options.name;
    this.apiKey = options.apiKey;
    this.model = options.model;
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
  }

  async *chat(messages: ChatMessage[], tools?: Tool[]): AsyncIterable<StreamEvent> {
    const convertedMessages = messages.map((msg) => ({
      ...msg,
      content: convertToOpenAIContent(msg.content),
    }));
    const body: Record<string, unknown> = {
      model: this.model,
      messages: convertedMessages,
      stream: true,
    };

    if (tools && tools.length > 0) {
      body.tools = tools.map((t) => ({
        type: "function",
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }));
    }

    const url = `${this.baseUrl}/v1/chat/completions`;
    log.provider.start(`${this.name === 'deepseek' ? 'cursor' : this.name} API call → ${this.model}`);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      log.provider.error(`${this.name === 'deepseek' ? 'cursor' : this.name} API error (${res.status}): ${text.slice(0, 200)}`);
      throw new Error(`${this.name === 'deepseek' ? 'cursor' : this.name} API error (${res.status}): ${text}`);
    }

    log.provider.info(`${this.name === 'deepseek' ? 'cursor' : this.name} API response: ${res.status} — streaming`);

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";
    const toolCalls = new Map<number, { id: string; name: string; args: string }>();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") {
          for (const tc of toolCalls.values()) {
            let args: Record<string, unknown> = {};
            try { args = JSON.parse(tc.args); } catch {}
            yield { type: "tool_call", id: tc.id, name: tc.name, args };
          }
          log.provider.done(`${this.name === 'deepseek' ? 'cursor' : this.name} stream finished`);
          yield { type: "done" };
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta;
          if (!delta) continue;

          if (delta.content) {
            yield { type: "text_delta", content: delta.content };
          }

          if (delta.tool_calls) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index ?? 0;
              if (!toolCalls.has(idx)) {
                toolCalls.set(idx, { id: tc.id ?? "", name: tc.function?.name ?? "", args: "" });
              }
              const existing = toolCalls.get(idx)!;
              if (tc.id) existing.id = tc.id;
              if (tc.function?.name) existing.name = tc.function.name;
              if (tc.function?.arguments) existing.args += tc.function.arguments;
            }
          }
        } catch {
          // skip malformed JSON lines
        }
      }
    }
  }
}

// Presets for common providers
export const PROVIDER_PRESETS: Record<string, { baseUrl: string; defaultModel: string }> = {
  deepseek: { baseUrl: "https://api.deepseek.com", defaultModel: "deepseek-chat" },
  kimi: { baseUrl: "https://api.moonshot.cn/v1", defaultModel: "moonshot-v1-8k" },
  groq: { baseUrl: "https://api.groq.com/openai/v1", defaultModel: "llama-3.3-70b-versatile" },
  ollama: { baseUrl: "http://localhost:11434/v1", defaultModel: "llama3.2" },
};
