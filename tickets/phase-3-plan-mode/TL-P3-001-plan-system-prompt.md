# TL-P3-001: Plan Mode System Prompt & JSON Schema

**Phase:** 3 - Plan Mode
**Assignee:** TL (Tech Lead)
**Priority:** Critical
**Dependencies:** BE-P2-007

## Description
Design and implement the system prompt that instructs the AI to output structured plans in JSON format, and define the plan step schema.

## Acceptance Criteria
- [ ] `src/plan/types.ts` — plan step TypeScript types:
  ```typescript
  interface PlanStep {
    id: number
    type: "create" | "edit" | "delete" | "shell" | "search"
    description: string
    target: string        // file path or shell command
    details: string       // specific changes, code snippets, or args
  }
  interface Plan {
    summary: string
    steps: PlanStep[]
  }
  ```
- [ ] System prompt addition for plan mode that instructs the AI to:
  - First gather context using tools (read files, search)
  - Then output a plan as a JSON block wrapped in ```json markers
  - Each step should be specific and actionable
  - Include enough detail in `details` field for execution
- [ ] `src/plan/planner.ts` — parses AI response to extract JSON plan
- [ ] Handles cases where AI outputs text before/after the JSON block
- [ ] Validation: reject plans with unknown step types or missing fields
- [ ] Returns parsed `Plan` object or error with AI's raw response

## Notes
- The AI should first use tools to understand the codebase, THEN generate the plan
- Plan prompt should encourage small, focused steps over large changes

## Mock Strategy (for parallel development)
- Develop system prompt and JSON schema independently
- Test by calling AI provider directly with the prompt, verify JSON output
- Export plan types and parser as standalone module
- FE and BE mock with a hardcoded plan JSON until integration
