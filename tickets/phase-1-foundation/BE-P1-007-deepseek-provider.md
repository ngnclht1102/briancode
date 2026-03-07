# BE-P1-007: DeepSeek AI Provider Integration

**Phase:** 1 - Foundation
**Assignee:** BE (Backend Dev)
**Priority:** Critical
**Dependencies:** BE-P1-002

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

## Mock Strategy (for parallel development)
- **Do NOT wait for BE-P1-002 (server)**
- Develop as standalone module with its own test file
- Test directly: call provider, iterate stream, print deltas
- Mock for others: export a `MockProvider` that returns canned streaming responses (useful for FE testing)
- Real server integration during TL-P1-014 (integration)
