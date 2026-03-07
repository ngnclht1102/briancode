# TL-P6-011: Integration — Phase 6 Polish

**Phase:** 6 - Polish
**Assignee:** TL (Tech Lead)
**Priority:** High
**Dependencies:** FE-P6-001 through FE-P6-005, BE-P6-003, BE-P6-004

## Description
Integrate all polish features into the complete system. Verify everything works together without regressions.

## Integration Tasks

### 1. File Tree Sidebar
- [ ] File tree (FE-P6-001) connected to real workspace scanner API
- [ ] Click file → adds to chat context correctly
- [ ] Modified files highlighting syncs with execution events

### 2. Syntax Highlighting
- [ ] Shiki (FE-P6-002) renders code blocks in chat and diff views
- [ ] Language detection works across all components
- [ ] No performance regression from Shiki loading

### 3. Rollback Enhancement
- [ ] Enhanced rollback (BE-P6-003) integrated with execution flow
- [ ] Undo button in chat works with real change history
- [ ] Per-execution rollback works

### 4. Conversation History
- [ ] History (BE-P6-004) saves and loads correctly
- [ ] History list in UI loads previous conversations
- [ ] New Chat clears state correctly

### 5. Theme & Shortcuts
- [ ] Theme toggle works across all components (chat, plan, diff, file tree, settings)
- [ ] All keyboard shortcuts work without conflicts
- [ ] Persisted preferences load on startup

## Acceptance Criteria
- [ ] All polish features work together without regressions
- [ ] Full flow still works: chat → tools → plan → execute → rollback
- [ ] Theme consistent across all views
- [ ] No performance regressions
