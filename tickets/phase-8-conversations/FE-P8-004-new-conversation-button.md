# FE-P8-004: New Conversation Button

**Phase:** 8 - Conversation Management
**Assignee:** FE (Frontend Dev)
**Priority:** High
**Dependencies:** BE-P8-005

## Description
Add a prominent "New Chat" button and wire the existing Cmd+N shortcut to properly create a new conversation on both frontend and backend.

## Acceptance Criteria
- [ ] "New Chat" button visible in the sidebar header or status bar
- [ ] Clicking it calls `POST /api/conversation/new` then clears local state
- [ ] Cmd/Ctrl+N shortcut also calls the backend endpoint
- [ ] After new chat: chat view is empty, input is focused, conversation list refreshed
- [ ] Previous conversation remains in history list
- [ ] Button disabled while a chat is actively streaming

## Technical Notes
- Currently `handleNewChat` only clears frontend state — need to also hit backend
- Ensure the new conversation ID is tracked so subsequent messages are saved correctly

## Mock Strategy
- No mocks needed — pure frontend + API call
