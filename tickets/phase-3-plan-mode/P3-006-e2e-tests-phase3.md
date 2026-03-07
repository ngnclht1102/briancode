# P3-006: E2E Tests — Phase 3 Plan Mode

**Phase:** 3 - Plan Mode
**Assignee:** AQA (Automation QA)
**Priority:** High
**Dependencies:** P3-002, P3-003, P1-011

## Description
Write Playwright E2E tests for plan generation, plan display, and plan review workflow.

## Test Specs

### `tests/plan-display.spec.ts`
```
- should display plan steps when AI generates a plan
- should show step number, type badge, description, and target
- should show expandable details section
- should display all step types correctly (create, edit, delete, shell)
- should handle plan with 1 step
- should handle plan with 15+ steps (scrollable)
```

### `tests/plan-review.spec.ts`
```
- should have all steps checked by default
- should allow unchecking individual steps
- should allow re-checking skipped steps
- should open inline editor on Edit button click
- should preserve edited details
- should show Execute button
- should show Reject Plan button
- should return to chat on Reject
- should disable chat input while plan is active
```

### `tests/plan-execute-trigger.spec.ts`
```
- should send approved step IDs on Execute click
- should not include unchecked steps in execution request
- should include edited details in execution request
```

## Acceptance Criteria
- [ ] All test specs above implemented and passing
- [ ] Mock AI returns deterministic plan JSON for consistent tests
- [ ] Tests verify DOM state (checkboxes, buttons, text content)
- [ ] Tests run in <60s total

## Notes
- Mock AI provider to return a known plan JSON block
- Test the UI interactions, not the AI quality (that's manual QA's job)
