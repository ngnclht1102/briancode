# MQA-P3-005: Manual QA — Phase 3 Plan Mode

**Phase:** 3 - Plan Mode
**Assignee:** MQA (Manual QA)
**Priority:** High
**Dependencies:** FE-P3-002, BE-P3-003

## Description
Manually test plan generation, plan review UI, and step editing workflow.

## Test Cases

### TC-3.1: Plan Generation
- [ ] "Add a new React component called Button" → generates create step
- [ ] "Fix the bug in auth.ts" → AI reads file first, then generates edit step
- [ ] "Set up Jest testing" → generates shell (npm install) + create steps
- [ ] "Refactor utils into separate files" → generates multi-step plan
- [ ] Simple question "What is React?" → responds as chat, no plan generated

### TC-3.2: Plan Display
- [ ] Plan steps numbered correctly
- [ ] Each step shows type badge (create/edit/delete/shell)
- [ ] Description is clear and readable
- [ ] Target file/command visible
- [ ] Details expandable and showing specific changes
- [ ] Steps with code show syntax-formatted content

### TC-3.3: Plan Review
- [ ] All steps checked (approved) by default
- [ ] Can uncheck individual steps to skip them
- [ ] Can re-check skipped steps
- [ ] "Edit" button opens inline editor for step details
- [ ] Edited details are preserved
- [ ] "Execute All" button visible and clickable
- [ ] "Reject Plan" dismisses and returns to chat
- [ ] Chat input disabled while plan is active

### TC-3.4: Edge Cases
- [ ] Plan with 1 step → displays correctly
- [ ] Plan with 15+ steps → scrollable, all visible
- [ ] AI fails to generate valid JSON plan → falls back to chat message
- [ ] Reject plan → can type a new prompt immediately
- [ ] Network disconnect during plan generation → error shown

## Test Projects
- [ ] Test on a React project
- [ ] Test on a Node.js API project
- [ ] Test on an empty project
