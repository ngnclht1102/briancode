# TL-P9-001: Integration -- Phase 9

**Phase:** 9 - Plan Mode Redesign
**Assignee:** TL (Tech Lead)
**Priority:** High
**Dependencies:** BE-P9-001, BE-P9-002, BE-P9-003, FE-P9-001, FE-P9-002, FE-P9-003

## Description
Integrate all Phase 9 changes into the complete system. Ensure the new plan-then-execute-per-step flow works end to end.

## Integration Checklist
- [ ] New plan prompt generates readable text plans
- [ ] `parsePlan()` correctly extracts steps from text format
- [ ] `plan:steps` WS event sends steps without content to frontend
- [ ] PlanView displays text plan with toggle/approve UI
- [ ] Execute sends steps without content to backend
- [ ] Backend generates content per step via AI API call
- [ ] "generating" progress state appears in UI during AI calls
- [ ] Diffs appear one at a time as steps complete
- [ ] Shell and delete steps execute directly without AI call
- [ ] Cancel works between steps
- [ ] Rollback works after partial execution
- [ ] Chat handler still detects plans in AI responses

## Test Scenarios
1. Ask AI to "Create a login page" -- should produce text plan, execute step by step
2. Ask AI to "Refactor utils.ts into separate files" -- multi-step edit/create plan
3. Cancel mid-execution -- should stop cleanly
4. Rollback after 2/4 steps succeed -- should revert both files
