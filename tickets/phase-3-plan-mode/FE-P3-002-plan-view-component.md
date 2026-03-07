# FE-P3-002: Plan View UI Component

**Phase:** 3 - Plan Mode
**Assignee:** FE (Frontend Dev)
**Priority:** Critical
**Dependencies:** FE-P1-005, TL-P3-001

## Description
Build the PlanView component that displays the AI-generated plan and lets users review, approve, skip, or edit steps.

## Acceptance Criteria
- [ ] `PlanView.tsx` — displays plan steps as a numbered list
- [ ] Each step shows:
  - Step number and type icon (create/edit/delete/shell/search)
  - Description text
  - Target file or command
  - Expandable details section
- [ ] Checkbox per step to approve/skip (all approved by default)
- [ ] Edit button per step — opens inline editor for `details` field
- [ ] "Execute All" button (sends approved steps to server)
- [ ] "Reject Plan" button (dismisses plan, back to chat)
- [ ] Visual distinction by step type (color-coded badges)
- [ ] Handle `plan:steps` WebSocket event to render the plan
- [ ] Send `plan:approve` with selected step IDs when user clicks Execute
- [ ] Add plan state to Zustand store (current plan, step statuses)

## Notes
- Plan replaces the chat input area while active
- After execution, return to chat with a summary of what was done

## Mock Strategy (for parallel development)
- **Do NOT wait for TL-P3-001 or BE-P3-003**
- Mock plan data: hardcoded `Plan` object with 5 sample steps of various types
- Build entire review UI (checkboxes, edit, approve, reject) against mock data
- Dispatch mock `plan:steps` WebSocket event to test rendering
- Real plan data wired during TL-P3-008 (integration)
