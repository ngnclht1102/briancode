# P3-003: Plan Mode WebSocket Integration

**Phase:** 3 - Plan Mode
**Assignee:** BE (Backend Dev)
**Priority:** Critical
**Dependencies:** P3-001, P2-006

## Description
Integrate plan generation into the WebSocket handler. When the AI generates a plan, parse it and send structured steps to the frontend.

## Acceptance Criteria
- [ ] Detect when AI response contains a JSON plan block
- [ ] Parse plan using planner module
- [ ] Send `plan:steps` event to frontend with parsed steps
- [ ] Handle `plan:approve` from frontend — store approved step IDs
- [ ] Handle `plan:edit` from frontend — update step details
- [ ] Handle `plan:execute` — trigger execution (placeholder, actual execution in Phase 4)
- [ ] If plan parsing fails, fall back to showing raw AI response as chat message
- [ ] Support "chat mode" vs "plan mode" — plan mode is the default for actionable requests

## Notes
- The transition from chat to plan should be seamless
- User should still see the AI's thinking/explanation before the plan
