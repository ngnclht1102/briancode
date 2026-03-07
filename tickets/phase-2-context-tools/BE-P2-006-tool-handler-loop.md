# BE-P2-006: Tool Handler & AI Tool-Use Loop

**Phase:** 2 - Context & Tools
**Assignee:** BE (Backend Dev)
**Priority:** Critical
**Dependencies:** BE-P2-003, BE-P2-004, BE-P2-005

## Description
Implement the tool handler that routes AI tool calls to the correct module, and the agentic loop that continues the conversation after tool results.

## Acceptance Criteria
- [ ] `src/context/tool-handler.ts` — registry of available tools
- [ ] Routes tool calls by name to the correct handler function
- [ ] Returns tool results back to the AI as tool_result messages
- [ ] Agentic loop in `ws-handler.ts`:
  1. Send messages + tools to AI provider
  2. If AI responds with tool_call → execute tool → append result → call AI again
  3. Repeat until AI responds with text (no more tool calls)
  4. Stream final text response to client
- [ ] Max tool call iterations: 10 (prevent infinite loops)
- [ ] Stream `chat:tool_call` and `chat:tool_result` events to frontend for visibility
- [ ] Error handling: if tool execution fails, return error message to AI (let it recover)

## Notes
- This is the core agentic loop — the AI decides what context it needs
- Each iteration is a full AI API call, so latency adds up. Keep tool results concise.

## Mock Strategy (for parallel development)
- **Do NOT wait for individual tool implementations (BE-P2-003/004/005)**
- Mock all tools: register fake handlers that return canned responses
- Mock AI provider: return a sequence of `tool_call` then `text` events
- Focus on the loop logic: call AI → get tool_call → execute → feed back → repeat
- Real tools and provider wired during TL-P2-013 (integration)
