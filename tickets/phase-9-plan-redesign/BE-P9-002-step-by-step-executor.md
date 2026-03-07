# BE-P9-002: Step-by-Step AI Executor

**Phase:** 9 - Plan Mode Redesign
**Assignee:** BE (Backend Dev)
**Priority:** High
**Dependencies:** BE-P9-001

## Description
Replace the current executor that applies pre-generated content with a new executor that makes an AI API call per step to generate the file content on demand, then applies it.

## Current Behavior
- `executeSteps()` in `executor.ts` receives steps with pre-filled `content`
- For create/edit: writes `step.content` to disk directly
- All content was generated upfront during plan phase

## New Behavior
- `executeSteps()` receives steps WITHOUT content (only type, target, description)
- For each `create` or `edit` step:
  1. Read the current file content (for edit) or note it doesn't exist (for create)
  2. Send a focused AI API request: "Generate the complete file content for this step"
  3. Stream progress to the client (show "Generating..." state)
  4. Apply the generated content to disk
  5. Show diff to client
  6. Move to next step
- For `shell` steps: execute directly (no AI call needed)
- For `delete` steps: delete directly (no AI call needed)
- Each step is independent -- one API call per file

## New Step Execution Prompt
For each create/edit step, the AI call should include:
- The overall plan summary (for context)
- The specific step description
- The current file content (for edits) or "file does not exist" (for creates)
- The project file tree (for imports/references)
- Instruction: "Output ONLY the complete new file content, no explanation"

## Files to Modify
- `packages/server/src/executor/executor.ts` -- Add AI call per step
- `packages/server/src/executor/step-generator.ts` -- NEW: generates content for a single step via AI

## WebSocket Events (new/modified)
- `execute:progress` status gains `"generating"` state (AI is generating content for this step)
- Existing `"running"`, `"success"`, `"error"`, `"skipped"` remain

## Technical Notes
- Use the same provider instance (`getProvider()`) for step generation
- The step generation prompt should be minimal and focused to get fast responses
- Include conversation context so AI remembers what was discussed
- Must handle cancellation between steps (check `cancelled` flag before each AI call)
- Stream the AI response but don't show it to user -- just wait for completion then apply
