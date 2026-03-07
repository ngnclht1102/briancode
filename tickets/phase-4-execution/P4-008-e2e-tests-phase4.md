# P4-008: E2E Tests — Phase 4 Execution

**Phase:** 4 - Execution
**Assignee:** AQA (Automation QA)
**Priority:** High
**Dependencies:** P4-004, P4-005, P1-011

## Description
Write Playwright E2E tests for plan execution: file operations, shell commands, diffs, progress, and rollback.

## Test Specs

### `tests/execute-file-ops.spec.ts`
```
- should create a new file and show diff (all green)
- should edit existing file and show before/after diff
- should delete file and show diff (all red)
- should create parent directories for nested paths
- should verify file exists on disk after creation
- should verify file content matches after edit
```

### `tests/execute-shell.spec.ts`
```
- should execute shell command and stream output
- should show exit code on completion
- should handle failed command with error display
- should block dangerous commands
```

### `tests/execute-progress.spec.ts`
```
- should show running status (spinner) for current step
- should show success (checkmark) for completed steps
- should show error (X) for failed steps
- should show skipped status for unchecked steps
- should auto-scroll to current step
- should show summary after all steps complete
```

### `tests/execute-cancel-rollback.spec.ts`
```
- should stop execution on Cancel click
- should show Rollback button after cancel
- should show Rollback button after error
- should restore files to original state on Rollback
- should show confirmation dialog before rollback
- should verify files restored on disk after rollback
```

### `tests/execute-full-flow.spec.ts`
```
- should complete full flow: prompt → plan → approve → execute → success
- should handle partial approval (skip some steps)
- should return to chat after execution completes
```

## Acceptance Criteria
- [ ] All test specs above implemented and passing
- [ ] Tests use a temporary project directory (cleaned up after each test)
- [ ] File system assertions: verify actual files on disk
- [ ] Mock AI provider for deterministic plans
- [ ] Tests run in <120s total

## Notes
- Use `fs` assertions to verify files on disk (not just UI)
- Create temp project dir per test to avoid interference
- Shell command tests: use safe commands like `echo`, `ls`
