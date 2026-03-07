# TL-P3-008: Integration — Phase 3 Plan Mode

**Phase:** 3 - Plan Mode
**Assignee:** TL (Tech Lead)
**Priority:** Critical
**Dependencies:** TL-P3-001, FE-P3-002, BE-P3-003

## Description
Integrate plan mode components into the working system. Wire plan generation, parsing, review UI, and approval flow.

## Integration Tasks

### 1. Plan Generation Flow
- [ ] Connect plan system prompt (TL-P3-001) with context builder and AI provider
- [ ] AI uses tools to gather context THEN generates plan JSON
- [ ] Plan parser extracts JSON from AI response correctly

### 2. Plan Display Wiring
- [ ] Server sends `plan:steps` event → PlanView (FE-P3-002) renders steps
- [ ] Verify all step types display correctly (create/edit/delete/shell)
- [ ] Step details expandable and editable

### 3. Plan Approval Flow
- [ ] User approves/skips steps → `plan:approve` sent to server
- [ ] User edits step details → `plan:edit` sent to server
- [ ] Server stores approved steps for execution (Phase 4)
- [ ] Reject plan returns to chat

### 4. Mode Switching
- [ ] Chat mode vs plan mode transition is seamless
- [ ] AI explanation text appears before plan JSON
- [ ] If plan parsing fails, falls back to showing raw chat

## Acceptance Criteria
- [ ] "Add a login page" → AI reads project → generates plan → displayed in UI
- [ ] User can approve/skip/edit/reject plan steps
- [ ] Plan approval data ready for executor (Phase 4)
- [ ] No mock plan data remaining
