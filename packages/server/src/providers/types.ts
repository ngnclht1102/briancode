export interface ToolCallEntry {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  tool_calls?: ToolCallEntry[];
}

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export type StreamEvent =
  | { type: "text_delta"; content: string }
  | { type: "tool_call"; id: string; name: string; args: Record<string, unknown> }
  | { type: "done" };

export interface AIProvider {
  name: string;
  chat(
    messages: ChatMessage[],
    tools?: Tool[],
  ): AsyncIterable<StreamEvent>;
}
