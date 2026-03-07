# AQA-P9-001: E2E Tests -- Phase 9 Plan Mode Redesign

**Phase:** 9 - Plan Mode Redesign
**Assignee:** AQA (Automation QA)
**Priority:** High
**Dependencies:** TL-P9-001

## Test Scenarios

### E2E-9.1: Plan Appears as Text
- Send a message requesting a code change
- Assert plan panel appears
- Assert plan contains step descriptions (not JSON/file content)
- Assert each step shows type badge and file path

### E2E-9.2: Execute Step-by-Step
- Approve a plan with 2+ steps
- Click Execute
- Assert "generating" state appears for first create/edit step
- Assert diff appears after first step completes
- Assert second step starts only after first completes
- Assert execution summary shown at end

### E2E-9.3: Cancel Execution
- Start executing a multi-step plan
- Click Cancel during execution
- Assert remaining steps are skipped
- Assert completed steps show success
- Assert cancel happened cleanly

### E2E-9.4: Toggle Steps
- View a plan with 3+ steps
- Uncheck one step
- Click Execute
- Assert unchecked step is skipped
- Assert other steps execute normally

### E2E-9.5: Rollback
- Execute a plan that modifies files
- After completion, trigger rollback
- Assert files reverted to original state

## Technical Notes
- May need longer timeouts since each step involves an AI API call
- Use mock AI provider for deterministic tests if available
- Verify WebSocket events include the new "generating" status
