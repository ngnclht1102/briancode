# BE-P6-003: Rollback & Undo Support

**Phase:** 6 - Polish
**Assignee:** BE (Backend Dev)
**Priority:** High
**Dependencies:** BE-P4-004

## Description
Enhance rollback support with a proper undo system that tracks all file changes per session.

## Acceptance Criteria
- [ ] Change history: track every file modification with before/after snapshots
- [ ] `POST /api/rollback/:executionId` — rollback all changes from a specific plan execution
- [ ] `POST /api/undo` — undo the last file change
- [ ] UI: "Undo" button in chat after execution completes
- [ ] UI: "Rollback" button per executed plan in history
- [ ] Confirmation dialog before rollback ("This will revert N files. Continue?")
- [ ] Cannot rollback shell commands — show warning for plans that included shell steps
- [ ] Change history persisted for current session (cleared on restart)

## Notes
- Rollback is file-level only — database changes, npm installs etc. can't be undone
- Make this clear in the UI

## Mock Strategy (for parallel development)
- Develop as standalone module with in-memory change tracking
- Test by simulating file operations and verifying rollback
- No dependency on executor — accept change records directly
- Wired into execution flow during TL-P6-011 (integration)
