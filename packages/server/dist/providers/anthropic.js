import { convertToAnthropicContent } from "./message-converter.js";
import { log } from "../logger.js";
export class AnthropicProvider {
    name = "anthropic";
    supportsVision = true;
    apiKey;
    model;
    baseUrl;
    constructor(options) {
        this.apiKey = options.apiKey;
        this.model = options.model ?? "claude-sonnet-4-20250514";
        this.baseUrl = (options.baseUrl ?? "https://api.anthropic.com").replace(/\/$/, "");
    }
    async *chat(messages, tools) {
        // Extract system message
        let system;
        const apiMessages = [];
        for (const msg of messages) {
            if (msg.role === "system") {
                system = typeof msg.content === "string" ? msg.content : msg.content.filter(b => b.type === "text").map(b => b.text).join("\n");
                continue;
            }
            if (msg.role === "assistant" && msg.tool_calls && msg.tool_calls.length > 0) {
                // Convert to Anthropic format: text block + tool_use blocks
                const content = [];
                if (msg.content) {
                    content.push({ type: "text", text: msg.content });
                }
                for (const tc of msg.tool_calls) {
                    let input = {};
                    try {
                        input = JSON.parse(tc.function.arguments);
                    }
                    catch { }
                    content.push({
                        type: "tool_use",
                        id: tc.id,
                        name: tc.function.name,
                        input,
                    });
                }
                apiMessages.push({ role: "assistant", content });
            }
            else if (msg.role === "tool") {
                apiMessages.push({
                    role: "user",
                    content: [{
                            type: "tool_result",
                            tool_use_id: msg.tool_call_id,
                            content: msg.content,
                        }],
                });
            }
            else {
                apiMessages.push({ role: msg.role, content: convertToAnthropicContent(msg.content) });
            }
        }
        const body = {
            model: this.model,
            messages: apiMessages,
            max_tokens: 8192,
            stream: true,
        };
        if (system)
            body.system = system;
        if (tools && tools.length > 0) {
            body.tools = tools.map((t) => ({
                name: t.name,
                description: t.description,
                input_schema: t.parameters,
            }));
        }
        log.provider.start(`Anthropic API call → ${this.model}`);
        const res = await fetch(`${this.baseUrl}/v1/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": this.apiKey,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const text = await res.text();
            log.provider.error(`Anthropic API error (${res.status}): ${text.slice(0, 200)}`);
            throw new Error(`Anthropic API error (${res.status}): ${text}`);
        }
        log.provider.info(`Anthropic API response: ${res.status} — streaming`);
        const reader = res.body?.getReader();
        if (!reader)
            throw new Error("No response body");
        const decoder = new TextDecoder();
        let buffer = "";
        // Track current tool use block
        let currentToolId = "";
        let currentToolName = "";
        let currentToolArgs = "";
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith("data: "))
                    continue;
                const data = trimmed.slice(6);
                try {
                    const event = JSON.parse(data);
                    switch (event.type) {
                        case "content_block_start": {
                            const block = event.content_block;
                            if (block?.type === "tool_use") {
                                currentToolId = block.id;
                                currentToolName = block.name;
                                currentToolArgs = "";
                            }
                            break;
                        }
                        case "content_block_delta": {
                            const delta = event.delta;
                            if (delta?.type === "text_delta" && delta.text) {
                                yield { type: "text_delta", content: delta.text };
                            }
                            else if (delta?.type === "input_json_delta" && delta.partial_json) {
                                currentToolArgs += delta.partial_json;
                            }
                            break;
                        }
                        case "content_block_stop": {
                            if (currentToolId) {
                                let args = {};
                                try {
                                    args = JSON.parse(currentToolArgs);
                                }
                                catch { }
                                yield { type: "tool_call", id: currentToolId, name: currentToolName, args };
                                currentToolId = "";
                                currentToolName = "";
                                currentToolArgs = "";
                            }
                            break;
                        }
                        case "message_stop":
                            log.provider.done("Anthropic stream finished");
                            yield { type: "done" };
                            return;
                    }
                }
                catch {
                    // skip malformed lines
                }
            }
        }
    }
}
//# sourceMappingURL=anthropic.js.map