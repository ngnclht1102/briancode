# BE-P8-005: New Conversation Endpoint

**Phase:** 8 - Conversation Management
**Assignee:** BE (Backend Dev)
**Priority:** High
**Dependencies:** BE-P8-001

## Description
Add an API endpoint to explicitly start a new conversation, resetting chat state and creating a fresh conversation entry.

## Acceptance Criteria
- [ ] `POST /api/conversation/new` endpoint
- [ ] Resets chat handler state (`resetChatState()`)
- [ ] Starts a new conversation in history module (`startConversation()`)
- [ ] Returns `{ success: true, conversationId: "conv-xxx" }`
- [ ] Broadcasts `{ type: "conversation:new", conversationId }` to all WS clients

## Technical Notes
- This formalizes the "New Chat" action on the backend
- Currently `handleNewChat` in the frontend only clears local state — this ensures backend is also reset
- Should be called before the first message of a new conversation

## Mock Strategy
- Call endpoint, verify new conversation file created, verify chat state reset
