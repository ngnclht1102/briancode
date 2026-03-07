# FE-P4-005: Execution Progress UI

**Phase:** 4 - Execution
**Assignee:** FE (Frontend Dev)
**Priority:** High
**Dependencies:** FE-P3-002, BE-P4-004

## Description
Update the PlanView component to show real-time execution progress as each step runs.

## Acceptance Criteria
- [ ] Each step in PlanView updates its status during execution:
  - Pending: gray, waiting
  - Running: blue, spinner
  - Success: green, checkmark
  - Error: red, X icon with error message
  - Skipped: gray, strikethrough
- [ ] Live shell output displayed in a terminal-like block under the step
- [ ] Diff displayed inline under file operation steps
- [ ] "Cancel" button visible during execution
- [ ] "Rollback" button appears if any step fails
- [ ] After execution completes, show summary and return to chat
- [ ] Handle `execute:progress`, `execute:done`, `execute:error`, `execute:diff` events

## Notes
- Keep the UI responsive during long-running shell commands
- Auto-scroll to currently executing step

## Mock Strategy (for parallel development)
- **Do NOT wait for BE-P4-004**
- Mock WebSocket events: dispatch fake `execute:progress`, `execute:done`, `execute:error`, `execute:diff`
- Build progress UI (spinners, checkmarks, shell output, diffs) against mock events
- Real execution events wired during TL-P4-010 (integration)
