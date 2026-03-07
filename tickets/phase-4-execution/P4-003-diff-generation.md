# P4-003: Diff Generation & Display

**Phase:** 4 - Execution
**Assignee:** FE (Frontend Dev)
**Priority:** High
**Dependencies:** P4-001

## Description
Generate unified diffs for file changes and display them in the UI before and after execution.

## Acceptance Criteria
- [ ] Backend: `src/executor/diff.ts` — generates unified diff using `diff` npm package
- [ ] Frontend: `DiffView.tsx` — renders diffs with:
  - Added lines in green, removed lines in red
  - File path header
  - Line numbers on both sides
  - Collapsible unchanged sections
- [ ] Diff shown in two contexts:
  1. **Pre-execution**: after user clicks Execute, show diff for each edit step before applying
  2. **Post-execution**: in the execution progress, show what was changed
- [ ] Handle new files: show entire content as added (all green)
- [ ] Handle deleted files: show entire content as removed (all red)
- [ ] Send diffs via `execute:diff` WebSocket event

## Notes
- Use `diff` npm package on backend, render with CSS on frontend
- Shiki syntax highlighting deferred to Phase 6
