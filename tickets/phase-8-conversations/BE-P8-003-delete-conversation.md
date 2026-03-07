# BE-P8-003: Delete Conversation Endpoint

**Phase:** 8 - Conversation Management
**Assignee:** BE (Backend Dev)
**Priority:** High
**Dependencies:** None

## Description
Add an API endpoint to delete a saved conversation from disk.

## Acceptance Criteria
- [ ] `DELETE /api/history/:id` endpoint
- [ ] Deletes the conversation JSON file from `~/.brian-code/history/`
- [ ] Returns `{ success: true }` on successful deletion
- [ ] Returns `{ success: false, error: "Not found" }` if conversation doesn't exist
- [ ] If deleting the currently active conversation, reset chat state
- [ ] Validates ID format to prevent path traversal (only allow `conv-` prefix + digits)

## Technical Notes
- Add `deleteConversation(id)` function to `history.ts`
- Sanitize the ID to prevent directory traversal attacks
- Check if deleted conversation is the current active one

## Mock Strategy
- Create test conversation files, delete via curl, verify file removed
