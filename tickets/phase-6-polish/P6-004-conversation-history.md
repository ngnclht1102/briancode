# P6-004: Conversation History Persistence

**Phase:** 6 - Polish
**Assignee:** BE (Backend Dev)
**Priority:** Medium
**Dependencies:** P1-008

## Description
Persist conversation history so users can resume previous sessions or reference past interactions.

## Acceptance Criteria
- [ ] Save conversations to `~/.brian-code/history/` as JSON files
- [ ] Each conversation: `{ id, projectPath, startedAt, messages[], plans[] }`
- [ ] Auto-save after each message exchange
- [ ] REST endpoint: `GET /api/history` — list recent conversations
- [ ] REST endpoint: `GET /api/history/:id` — load specific conversation
- [ ] Frontend: conversation list in sidebar or dropdown
- [ ] "New Chat" button starts fresh conversation
- [ ] Load previous conversation → restore messages in chat UI
- [ ] Limit: keep last 50 conversations, auto-delete oldest

## Notes
- Don't store tool call results in history (too large) — just tool call names
- Conversation context is not reloaded into AI (too expensive) — just for user reference
