# BE-P9-003: Update WebSocket Protocol for Step-by-Step Execution

**Phase:** 9 - Plan Mode Redesign
**Assignee:** BE (Backend Dev)
**Priority:** Medium
**Dependencies:** BE-P9-002

## Description
Update the WebSocket message handling in `ws-handler.ts` to support the new execution flow where the frontend sends approved plan steps (without content) and the backend generates content per step.

## Current Behavior
- Client sends `{ type: "execute", steps: [...] }` with full content in each step
- Server executes all steps sequentially from pre-generated content

## New Behavior
- Client sends `{ type: "execute", steps: [...] }` with steps that have NO content
- Server generates content per step via AI, then applies
- New progress state `"generating"` sent before `"running"` for create/edit steps
- Plan text is sent via existing `plan:steps` event but with new shape

## Updated Protocol

```
Client -> Server:
  { type: "execute", steps: [{ id, type, target, description }] }
  // No content field -- backend generates it

Server -> Client:
  { type: "execute:progress", stepId, status: "generating" }  // NEW: AI generating
  { type: "execute:progress", stepId, status: "running" }     // Applying to disk
  { type: "execute:progress", stepId, status: "success" }
  { type: "execute:progress", stepId, status: "error", error }
  { type: "execute:diff", stepId, diff, filePath }
  { type: "execute:done", summary }
```

## Files to Modify
- `packages/server/src/server/ws-handler.ts` -- Update execute message handling
- `packages/server/src/executor/executor.ts` -- Send "generating" progress events

## Technical Notes
- The `execute` message format stays the same, just without `content`
- Backward compatible -- if `content` is present, use it directly (skip AI call)
