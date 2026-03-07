# TL-P4-010: Integration — Phase 4 Execution

**Phase:** 4 - Execution
**Assignee:** TL (Tech Lead)
**Priority:** Critical
**Dependencies:** BE-P4-001 through FE-P4-005

## Description
Integrate execution engine into the full plan-to-execute pipeline. Wire file ops, shell ops, diffs, progress, and rollback with the plan approval flow.

## Integration Tasks

### 1. Plan → Execute Pipeline
- [ ] Approved plan steps (from Phase 3) fed into executor orchestrator (BE-P4-004)
- [ ] Executor routes steps to correct handler (file-ops or shell-ops)
- [ ] Skipped steps ignored, edited details used

### 2. Progress Wiring
- [ ] Executor sends `execute:progress` → FE-P4-005 shows running/done/error per step
- [ ] Shell stdout/stderr streamed live via WebSocket
- [ ] Diff generated (BE) and displayed (FE-P4-003) for file operations

### 3. Cancel & Rollback Wiring
- [ ] Cancel button → server kills running process, stops execution
- [ ] Rollback button → executor restores all backed-up files
- [ ] Confirmation dialog works end-to-end

### 4. Full Flow Verification
- [ ] Prompt → tools gather context → plan generated → reviewed → executed → files changed on disk
- [ ] Multi-step plan: create + edit + shell all work in sequence
- [ ] Error in middle step: halts, shows error, rollback offered and works

## Acceptance Criteria
- [ ] Full prompt-to-execution flow works end-to-end
- [ ] Files actually modified on disk correctly
- [ ] Shell commands run and output streams live
- [ ] Rollback restores files to pre-execution state
- [ ] No mock executor responses remaining
