# P6-009: E2E Tests — Phase 6 Polish & Full Regression Suite

**Phase:** 6 - Polish
**Assignee:** AQA (Automation QA)
**Priority:** High
**Dependencies:** P6-001 through P6-006, P1-011

## Description
Write Playwright E2E tests for polish features and a full regression suite covering the entire app.

## Test Specs

### `tests/file-tree.spec.ts`
```
- should display file tree in sidebar
- should expand/collapse folders
- should filter files via search bar
- should toggle sidebar with keyboard shortcut (Cmd+B)
- should highlight modified files
```

### `tests/syntax-highlighting.spec.ts`
```
- should highlight code blocks in chat messages
- should highlight diffs in DiffView
- should auto-detect language from fence markers
```

### `tests/theme.spec.ts`
```
- should default to dark theme
- should toggle to light theme
- should persist theme choice across reload
- should respect prefers-color-scheme on first load
```

### `tests/keyboard-shortcuts.spec.ts`
```
- should send message on Cmd+Enter
- should start new chat on Cmd+N
- should focus input on Cmd+K
- should toggle sidebar on Cmd+B
- should dismiss/cancel on Escape
- should show help on Cmd+/
```

### `tests/conversation-history.spec.ts`
```
- should list previous conversations
- should load previous conversation messages
- should start new chat
- should persist history after restart
```

### `tests/regression-full-flow.spec.ts`
```
- should complete full flow: start → chat → tool calls → plan → execute → verify
- should work with file creation, editing, and shell commands
- should rollback successfully
- should work across provider switch
- should handle errors gracefully throughout
```

## Acceptance Criteria
- [ ] All test specs above implemented and passing
- [ ] Full regression suite runs in <180s
- [ ] Cross-browser: Chromium, Firefox, WebKit
- [ ] CI pipeline configured: runs on every PR
- [ ] Test coverage report generated
- [ ] All tests pass on clean install (`npm install -g` simulation)

## Notes
- Regression suite is the go/no-go gate for release
- Run cross-browser tests in CI, single browser locally for speed
