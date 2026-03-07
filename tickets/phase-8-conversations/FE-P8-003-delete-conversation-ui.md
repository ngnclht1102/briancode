# FE-P8-003: Delete Conversation UI

**Phase:** 8 - Conversation Management
**Assignee:** FE (Frontend Dev)
**Priority:** High
**Dependencies:** FE-P8-001, BE-P8-003

## Description
Add the ability to delete conversations from the history list.

## Acceptance Criteria
- [ ] Delete button (X or trash icon) on each conversation entry
- [ ] Click delete -> confirmation prompt ("Delete this conversation?")
- [ ] On confirm -> calls `DELETE /api/history/:id`
- [ ] On success -> removes entry from list with animation/transition
- [ ] If deleting the currently active conversation, clear the chat view
- [ ] Error handling if delete fails

## Technical Notes
- Use `window.confirm()` for simplicity, or a small inline confirmation
- Refresh the conversation list after deletion

## Mock Strategy
- Mock DELETE endpoint response
