# P1-007: DeepSeek AI Provider Integration

**Phase:** 1 - Foundation
**Assignee:** BE (Backend Dev)
**Priority:** Critical
**Dependencies:** P1-002

## Description
Implement the first AI provider (DeepSeek) with streaming support. Define the provider interface that all future providers will follow.

## Acceptance Criteria
- [ ] `src/providers/types.ts` — provider interface:
  ```typescript
  interface AIProvider {
    name: string
    chat(messages: ChatMessage[], tools?: Tool[]): AsyncIterable<StreamEvent>
  }
  type StreamEvent =
    | { type: "text_delta", content: string }
    | { type: "tool_call", id: string, name: string, args: Record<string, unknown> }
    | { type: "done" }
  ```
- [ ] `src/providers/deepseek.ts` — DeepSeek implementation using OpenAI-compatible API
- [ ] Streaming via `fetch` + `ReadableStream` (SSE parsing)
- [ ] API key from config or `DEEPSEEK_API_KEY` env var
- [ ] Model configurable (default: `deepseek-chat`)
- [ ] Error handling: invalid key, rate limit, network errors

## Notes
- DeepSeek uses OpenAI-compatible API format, so this also validates the generic approach
- Base URL: `https://api.deepseek.com`
