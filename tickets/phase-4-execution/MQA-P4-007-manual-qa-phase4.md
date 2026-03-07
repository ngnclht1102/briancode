# MQA-P4-007: Manual QA — Phase 4 Execution

**Phase:** 4 - Execution
**Assignee:** MQA (Manual QA)
**Priority:** High
**Dependencies:** BE-P4-004, FE-P4-005

## Description
Manually test plan execution: file operations, shell commands, diffs, progress reporting, and rollback.

## Test Cases

### TC-4.1: File Create
- [ ] Plan creates a new file → file exists on disk with correct content
- [ ] Nested path (src/pages/Login.tsx) → parent dirs created automatically
- [ ] Diff shows entire file as added (green)
- [ ] Verify file content matches what was shown in plan

### TC-4.2: File Edit
- [ ] Plan edits existing file → diff shows before/after correctly
- [ ] Added lines in green, removed lines in red
- [ ] File on disk matches the diff
- [ ] Original file backed up for rollback

### TC-4.3: File Delete
- [ ] Plan deletes a file → file removed from disk
- [ ] Diff shows entire file as removed (red)

### TC-4.4: Shell Commands
- [ ] `npm install axios` → runs, output streams live in UI
- [ ] `echo "hello"` → quick command, output shown
- [ ] Long-running command → progress visible, not frozen
- [ ] Failed command (e.g., `npm install nonexistent-pkg-xyz`) → error shown

### TC-4.5: Execution Progress
- [ ] Steps transition: gray → blue/spinner → green/checkmark
- [ ] Failed step shows red X with error message
- [ ] Subsequent steps not executed after failure
- [ ] Auto-scrolls to currently executing step
- [ ] Shell output visible in terminal-like block under step

### TC-4.6: Cancel & Rollback
- [ ] Click "Cancel" mid-execution → stops, no more steps run
- [ ] "Rollback" button appears after failure or cancel
- [ ] Click Rollback → all modified files restored to original
- [ ] Rollback confirmation dialog shown
- [ ] After rollback, files verified as restored on disk

### TC-4.7: Full Flow
- [ ] Prompt → plan → approve all → execute → all green → files correct on disk
- [ ] Prompt → plan → skip 2 steps → execute → skipped steps not run
- [ ] Prompt → plan → edit a step → execute → edited version used

### TC-4.8: Edge Cases
- [ ] Plan with only shell steps (no file ops) → works
- [ ] Plan with only file ops (no shell) → works
- [ ] Execute on read-only file → error, rollback offered
- [ ] Very large file edit (1000+ lines) → diff renders without lag
