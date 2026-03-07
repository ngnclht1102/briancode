# FE-P9-001: Redesign PlanView for Text-Based Plans

**Phase:** 9 - Plan Mode Redesign
**Assignee:** FE (Frontend Dev)
**Priority:** High
**Dependencies:** BE-P9-001

## Description
Redesign the PlanView component to display a high-level text plan instead of JSON steps with file content previews.

## Current Behavior
- PlanView shows each step as a card with type badge, description, target
- Each step has expandable file content preview and inline editor
- User can toggle steps on/off and edit content before execution

## New Behavior
- PlanView shows a clean text-based plan overview
- Each step shows: type badge, target file/command, description
- NO content preview or inline editor (content doesn't exist yet)
- User can still toggle steps on/off (approve/skip)
- Execute button sends steps WITHOUT content
- Simpler, cleaner UI focused on the overview

## UI Design
```
+--------------------------------------------------+
| Plan: Add user authentication                     |
|                                                   |
| [x] [CREATE] src/auth/middleware.ts               |
|     Create auth middleware with JWT validation     |
|                                                   |
| [x] [EDIT] src/server/router.ts                   |
|     Add auth middleware to protected routes        |
|                                                   |
| [x] [SHELL] npm install jsonwebtoken              |
|     Install JWT dependency                        |
|                                                   |
| [ ] [DELETE] src/old-auth.ts                      |
|     Remove deprecated auth module                 |
|                                                   |
|                        [Reject]  [Execute (3/4)]  |
+--------------------------------------------------+
```

## Files to Modify
- `packages/web/src/components/PlanView.tsx` -- Simplify UI, remove content preview/editor
- `packages/web/src/stores/planStore.ts` -- Remove `updateStepContent`, `content` is no longer user-editable

## Technical Notes
- The `PlanStep` type in planStore still has `content?: string` but it will always be undefined at plan time
- Remove the "Edit" button and expandable content section from StepItem
- Keep the checkbox toggle for approve/skip
- The `onExecute` callback should send steps without content
