# BE-P9-001: Redesign Plan Mode System Prompt

**Phase:** 9 - Plan Mode Redesign
**Assignee:** BE (Backend Dev)
**Priority:** High
**Dependencies:** None

## Description
Replace the current `PLAN_MODE_PROMPT` that instructs the AI to generate JSON with full file contents. The new prompt should instruct the AI to output a high-level text plan only.

## Current Behavior
- `PLAN_MODE_PROMPT` in `planner.ts` tells AI to output ```json blocks with full file contents
- `parsePlan()` extracts JSON from the response and validates it
- Plan steps include `content` field with complete file contents

## New Behavior
- New prompt tells AI to output a structured text plan (not JSON)
- Plan format: numbered list of steps, each with type tag and file path
- Example output format:

```
## Plan: Add user authentication

1. [CREATE] src/auth/middleware.ts -- Create auth middleware with JWT validation
2. [EDIT] src/server/router.ts -- Add auth middleware to protected routes
3. [EDIT] src/config.ts -- Add JWT_SECRET to config schema
4. [SHELL] npm install jsonwebtoken -- Install JWT dependency
5. [DELETE] src/old-auth.ts -- Remove deprecated auth module
```

- AI should NOT generate any file contents in the plan phase
- The plan is purely descriptive -- execution generates content later

## Files to Modify
- `packages/server/src/plan/planner.ts` -- Replace `PLAN_MODE_PROMPT`, rewrite `parsePlan()`
- `packages/server/src/plan/types.ts` -- Remove `content` from `PlanStep` for plan phase, add it back as optional for execution phase

## Technical Notes
- The new `parsePlan()` should parse the numbered text list format
- Each parsed step needs: id, type, target (file path or command), description
- Content field should be `undefined` at plan time (filled during execution)
- Keep the `ParseResult` interface compatible
