# BA-P9-001: Phase 9 Requirements -- Plan Mode Redesign

**Phase:** 9 - Plan Mode Redesign
**Assignee:** BA (Business Analyst)
**Priority:** High
**Dependencies:** None

## Description
Define and document requirements for the plan mode redesign.

## Current Behavior (Problem)
1. AI generates a full JSON plan with **complete file contents** for every step
2. This is extremely slow -- AI must write out entire files before user sees the plan
3. User clicks "Execute" and all steps apply at once from pre-generated content
4. No incremental feedback -- user waits for entire plan generation

## New Behavior (Target)

### Plan Phase
1. AI generates a **high-level text overview** of what it plans to do
2. Plan is described in natural language, NOT JSON with file contents
3. Plan lists the files to be changed and a brief description of each change
4. User reviews the text plan and can approve or reject

### Execution Phase
1. When user clicks "Execute", each step is executed **one at a time**
2. Each step sends a **focused AI API request** to generate the change for ONE file
3. The generated content is applied immediately and the diff is shown
4. User sees results incrementally (file by file) as each step completes
5. If a step fails, execution halts (existing behavior preserved)

## User Stories
1. As a user, I want to see a quick high-level plan before any code is generated
2. As a user, I want execution to show results file-by-file so I get feedback fast
3. As a user, I want to be able to cancel mid-execution between steps
4. As a user, I want to rollback if a step produces bad results

## Acceptance Criteria
- [ ] Plan is displayed as readable text, not JSON blocks
- [ ] Plan generation is significantly faster (no file content generation)
- [ ] Each execution step makes its own AI API call
- [ ] Diffs appear one at a time as steps complete
- [ ] Cancel and rollback still work
- [ ] Shell command steps execute directly (no AI call needed)
- [ ] Delete steps execute directly (no AI call needed)

## Edge Cases
- [ ] AI generates a plan with 10+ steps -- execution should still be incremental
- [ ] AI call fails for one step mid-execution -- halt cleanly, allow rollback
- [ ] User cancels during an AI call for a step -- cancel gracefully
- [ ] Very large file edit -- AI may need full file context to generate correct edit
- [ ] Plan references files that don't exist yet (create step before edit step)
