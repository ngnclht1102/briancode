# P4-001: File Operations Executor

**Phase:** 4 - Execution
**Assignee:** BE (Backend Dev)
**Priority:** Critical
**Dependencies:** P3-003

## Description
Implement file create, edit, and delete operations that execute plan steps against the actual filesystem.

## Acceptance Criteria
- [ ] `src/executor/file-ops.ts`:
  - `createFile(path, content)` — creates file + parent dirs if needed
  - `editFile(path, changes)` — applies edits to existing file
  - `deleteFile(path)` — deletes file (with confirmation flag)
- [ ] Before any write: backup original file content for rollback
- [ ] Edit strategy: AI provides full new file content or search/replace pairs
- [ ] Security: all paths resolved relative to project root, reject `..` traversal
- [ ] Returns diff (before vs after) for each file operation
- [ ] File encoding: handle UTF-8, detect and warn on binary files
- [ ] Create parent directories automatically for new files

## Notes
- Keep backups in memory (per session), not on disk
- The diff is sent to frontend for display before/after execution
