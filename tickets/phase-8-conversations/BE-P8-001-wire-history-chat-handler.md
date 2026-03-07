# BE-P8-001: Wire History into Chat Handler

**Phase:** 8 - Conversation Management
**Assignee:** BE (Backend Dev)
**Priority:** Critical
**Dependencies:** None

## Description
Connect the existing `history.ts` module to the chat handler so all user and assistant messages are automatically persisted to disk.

## Acceptance Criteria
- [ ] `startConversation()` called on first message if no active conversation
- [ ] Every user message saved via `addMessageToHistory("user", message)`
- [ ] Every assistant response saved via `addMessageToHistory("assistant", text)`
- [ ] Tool calls saved with tool name metadata
- [ ] `resetChatState()` also calls `resetConversation()` from history module
- [ ] Conversation ID available and sent to frontend via `chat:done` event
- [ ] On project switch, current conversation is finalized

## Technical Notes
- `chat-handler.ts` already has `conversationHistory` array — just add `addMessageToHistory()` calls alongside the existing `conversationHistory.push()` calls
- The history module already has `startConversation()`, `addMessageToHistory()`, `resetConversation()`
- Include conversation ID in `chat:done` WS event: `{ type: "chat:done", conversationId: "conv-xxx" }`

## Mock Strategy
- Test by sending chat messages and verifying JSON files created in `~/.brian-code/history/`
