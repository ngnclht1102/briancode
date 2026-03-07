# FE-P9-002: Add "Generating" State to Execution Progress

**Phase:** 9 - Plan Mode Redesign
**Assignee:** FE (Frontend Dev)
**Priority:** High
**Dependencies:** BE-P9-002, FE-P9-001

## Description
Update the ExecutionProgress component to handle the new "generating" status that indicates the AI is generating file content for a step.

## Current Behavior
- Step statuses: pending, running, success, error, skipped
- "running" means the step is being applied to disk

## New Behavior
- New status: `"generating"` -- AI is generating content for this step
- Flow per step: pending -> generating -> running -> success/error
- "generating" shows a distinct visual indicator (e.g., pulsing AI icon or "Generating..." text)
- For shell/delete steps: skip "generating", go straight to "running"

## UI Changes
- Add "generating" to STATUS_ICONS: use a sparkle or brain icon, or text "AI"
- Add "generating" to STATUS_COLORS: use purple/violet to distinguish from blue "running"
- Show a subtle label like "AI generating..." next to the step during this state
- Animate the icon (pulse or spin) to indicate active work

## Files to Modify
- `packages/web/src/stores/executionStore.ts` -- Add "generating" to ExecutionStep status type
- `packages/web/src/components/ExecutionProgress.tsx` -- Add generating state visuals

## Technical Notes
- The "generating" state may last several seconds per step (AI response time)
- This is the key UX improvement -- user sees progress step by step instead of waiting for everything
