# FE-P8-005: Active Conversation Indicator

**Phase:** 8 - Conversation Management
**Assignee:** FE (Frontend Dev)
**Priority:** Medium
**Dependencies:** FE-P8-001, FE-P8-002

## Description
Highlight the currently active conversation in the history list and show the conversation title in the UI.

## Acceptance Criteria
- [ ] Active conversation highlighted with distinct background/border color in the list
- [ ] Conversation title shown somewhere visible (e.g., above the chat area or in the sidebar header)
- [ ] Title updates as user sends first message (derived from first user message)
- [ ] "New Chat" shown as title when conversation has no messages yet
- [ ] Indicator clears when starting a new conversation (no conversation active until first message)

## Technical Notes
- Track `activeConversationId` in chatStore or a new conversationStore
- Update title from `chat:done` event which includes conversationId

## Mock Strategy
- Hardcode active conversation ID for styling development
