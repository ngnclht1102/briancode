# TL-P1-008: End-to-End Chat Flow

**Phase:** 1 - Foundation
**Assignee:** TL (Tech Lead)
**Priority:** Critical
**Dependencies:** FE-P1-005, FE-P1-006, BE-P1-007

## Description
Wire everything together: user types message in browser -> WebSocket -> server -> DeepSeek API -> stream response back -> display in chat UI.

## Acceptance Criteria
- [ ] User sends message from Input component
- [ ] Message sent via WebSocket as `{ type: "chat", message: "..." }`
- [ ] Server receives, builds message array, calls DeepSeek provider
- [ ] AI response streamed back as `chat:stream` deltas via WebSocket
- [ ] `chat:done` sent when stream completes
- [ ] Frontend displays streaming response in real-time
- [ ] Conversation history maintained (multi-turn chat works)
- [ ] Error messages displayed in UI if provider fails
- [ ] Basic system prompt: "You are Brian Code, an AI coding assistant."

## Notes
- This is the integration ticket — mostly wiring, not new components
- Test with a simple prompt like "What is TypeScript?"
- Verify multi-turn: ask a follow-up that references the previous answer
