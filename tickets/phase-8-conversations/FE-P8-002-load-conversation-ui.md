# FE-P8-002: Load Conversation from History

**Phase:** 8 - Conversation Management
**Assignee:** FE (Frontend Dev)
**Priority:** Critical
**Dependencies:** FE-P8-001, BE-P8-002

## Description
Clicking a conversation in the history list loads its messages into the chat view.

## Acceptance Criteria
- [ ] Click conversation entry -> calls `POST /api/conversation/load/:id`
- [ ] On success, clear current chat messages and populate with loaded messages
- [ ] Loaded messages render correctly (user messages, assistant messages with markdown, tool calls)
- [ ] Chat is scrolled to bottom after loading
- [ ] Loading state shown while fetching
- [ ] Error message if load fails
- [ ] Can continue chatting after loading (new messages append to loaded conversation)

## Technical Notes
- Need to convert loaded conversation messages into the `Message[]` format used by `chatStore`
- Tool calls in loaded conversations should show as collapsed/completed
- May need a `setMessages(messages)` action in chatStore

## Mock Strategy
- Hardcode a loaded conversation for initial development
