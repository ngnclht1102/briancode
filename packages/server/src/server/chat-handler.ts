import type { WebSocket } from "ws";
import type { ChatMessage } from "../providers/types.js";
import { getProvider } from "../providers/index.js";
import { getToolDefinitions, executeTool } from "../context/tool-handler.js";
import { buildSystemPrompt } from "../context/context-builder.js";
import { parsePlan, PLAN_MODE_PROMPT } from "../plan/planner.js";
import { addMessageToHistory, getCurrentConversationId, resetConversation } from "../history/history.js";

const MAX_TOOL_ITERATIONS = 10;

const conversationHistory: ChatMessage[] = [];
let systemPromptLoaded = false;

export function resetChatState() {
  conversationHistory.length = 0;
  systemPromptLoaded = false;
  resetConversation();
}

export function loadChatMessages(messages: ChatMessage[]) {
  conversationHistory.length = 0;
  conversationHistory.push(...messages);
  systemPromptLoaded = messages.some((m) => m.role === "system");
}

export async function chatHandler(socket: WebSocket, message: string) {
  // Inject system prompt on first message
  if (!systemPromptLoaded) {
    const basePrompt = await buildSystemPrompt();
    const fullPrompt = basePrompt + "\n\n" + PLAN_MODE_PROMPT;
    conversationHistory.unshift({ role: "system", content: fullPrompt });
    systemPromptLoaded = true;
  }

  conversationHistory.push({ role: "user", content: message });
  addMessageToHistory("user", message);

  const provider = getProvider();
  const tools = getToolDefinitions();

  try {
    let iterations = 0;

    while (iterations < MAX_TOOL_ITERATIONS) {
      iterations++;

      const stream = provider.chat(conversationHistory, tools);
      let fullText = "";
      const toolCalls: Array<{ id: string; name: string; args: Record<string, unknown> }> = [];

      for await (const event of stream) {
        if (event.type === "text_delta") {
          fullText += event.content;
          socket.send(JSON.stringify({ type: "chat:stream", delta: event.content }));
        } else if (event.type === "tool_call") {
          toolCalls.push({ id: event.id, name: event.name, args: event.args });
        }
      }

      // If no tool calls, we're done — AI gave a text response
      if (toolCalls.length === 0) {
        if (fullText) {
          conversationHistory.push({ role: "assistant", content: fullText });
          addMessageToHistory("assistant", fullText);

          // Check if the response contains a plan
          const parseResult = parsePlan(fullText);
          if (parseResult.plan) {
            socket.send(JSON.stringify({
              type: "plan:steps",
              plan: parseResult.plan,
            }));
          }
        }
        const convId = getCurrentConversationId();
        socket.send(JSON.stringify({ type: "chat:done", conversationId: convId }));
        return;
      }

      // AI made tool calls — record the assistant message with tool_calls
      conversationHistory.push({
        role: "assistant",
        content: fullText || "",
        tool_calls: toolCalls.map((tc) => ({
          id: tc.id,
          type: "function" as const,
          function: { name: tc.name, arguments: JSON.stringify(tc.args) },
        })),
      });
      if (fullText) {
        addMessageToHistory("assistant", fullText);
      }

      // Execute each tool call and feed results back
      for (const tc of toolCalls) {
        socket.send(
          JSON.stringify({
            type: "chat:tool_call",
            toolCallId: tc.id,
            name: tc.name,
            args: tc.args,
          }),
        );

        const result = await executeTool(tc.name, tc.args);

        socket.send(
          JSON.stringify({
            type: "chat:tool_result",
            toolCallId: tc.id,
            name: tc.name,
            result: result.length > 2000 ? result.slice(0, 2000) + "\n... (truncated)" : result,
          }),
        );

        conversationHistory.push({
          role: "tool",
          content: result,
          tool_call_id: tc.id,
        });
        addMessageToHistory("tool", result, [{ name: tc.name }]);
      }
    }

    // Hit max iterations
    socket.send(
      JSON.stringify({
        type: "chat:stream",
        delta: "\n\n[Reached maximum tool call iterations]",
      }),
    );
    const convId = getCurrentConversationId();
    socket.send(JSON.stringify({ type: "chat:done", conversationId: convId }));
  } catch (err) {
    socket.send(
      JSON.stringify({ type: "error", message: `Provider error: ${String(err)}` }),
    );
  }
}
