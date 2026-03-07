# BE-P4-004: Executor Orchestrator & Progress Reporting

**Phase:** 4 - Execution
**Assignee:** BE (Backend Dev)
**Priority:** Critical
**Dependencies:** BE-P4-001, BE-P4-002, FE-P4-003

## Description
Build the main executor that iterates through approved plan steps, executes each one, and reports progress to the frontend in real-time.

## Acceptance Criteria
- [ ] `src/executor/executor.ts` — orchestrates step execution:
  1. Iterate through approved steps in order
  2. Send `execute:progress` with `status: "running"` for current step
  3. Execute step based on type (file-ops or shell-ops)
  4. Send `execute:diff` for file changes
  5. Send `execute:done` with `status: "success"` or `execute:error`
  6. Continue to next step (or halt on error, configurable)
- [ ] Rollback support:
  - Track all file changes (original content stored in memory)
  - On error or user cancel: offer to rollback all changes
  - `rollback()` function restores all modified files
- [ ] Cancel support: handle `cancel` WebSocket message mid-execution
- [ ] Summary message after all steps complete:
  - N steps succeeded, M failed, K skipped
  - List of files modified/created/deleted
- [ ] Execution state in Zustand store (frontend): per-step status, current step

## Notes
- Default: halt on first error. Future: configurable to continue on error.
- Rollback is best-effort (can't undo shell commands)

## Mock Strategy (for parallel development)
- **Do NOT wait for BE-P4-001 or BE-P4-002**
- Mock file-ops: no-op functions that return fake diffs
- Mock shell-ops: no-op that returns fake output and exit code 0
- Focus on: step iteration, progress events, error handling, cancel, rollback logic
- Real ops wired during TL-P4-010 (integration)
