# P4-002: Shell Command Executor

**Phase:** 4 - Execution
**Assignee:** BE (Backend Dev)
**Priority:** Critical
**Dependencies:** P3-003

## Description
Implement shell command execution for plan steps like `npm install`, `git add`, etc.

## Acceptance Criteria
- [ ] `src/executor/shell-ops.ts`:
  - `runCommand(command, cwd)` — executes shell command
  - Streams stdout/stderr in real-time via WebSocket
  - Returns exit code and full output
- [ ] Use `child_process.spawn` for streaming output
- [ ] Working directory: project root by default
- [ ] Timeout: configurable, default 60 seconds
- [ ] Kill support: handle `cancel` message to kill running process
- [ ] Security:
  - Block obviously dangerous commands (`rm -rf /`, `sudo`, etc.)
  - Log all executed commands
- [ ] Send `execute:progress` events with live output lines

## Notes
- Use `spawn` not `exec` for streaming (exec buffers all output)
- Shell commands are inherently risky — the plan review step is the safety gate
