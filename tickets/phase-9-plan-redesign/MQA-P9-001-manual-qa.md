# MQA-P9-001: Manual QA -- Phase 9 Plan Mode Redesign

**Phase:** 9 - Plan Mode Redesign
**Assignee:** MQA (Manual QA)
**Priority:** High
**Dependencies:** TL-P9-001

## Test Cases

### TC-9.1: Plan Generation
- [ ] Ask AI to make a code change -- plan appears as readable text
- [ ] Plan shows numbered steps with type tags and file paths
- [ ] Plan does NOT contain JSON blocks or file contents
- [ ] Plan generation is noticeably faster than before

### TC-9.2: Plan Approval
- [ ] Can toggle individual steps on/off
- [ ] Execute button shows count of approved steps
- [ ] Reject button clears the plan
- [ ] No "Edit" button on steps (content not editable at plan time)

### TC-9.3: Step-by-Step Execution
- [ ] Click Execute -- steps execute one at a time
- [ ] Each step shows "generating" state while AI generates content
- [ ] Each step shows "running" state while applying to disk
- [ ] Diff appears for each step as it completes
- [ ] Shell commands execute directly (no "generating" state)
- [ ] Delete operations execute directly (no "generating" state)

### TC-9.4: Incremental Feedback
- [ ] First step's diff appears before last step starts
- [ ] User can see progress in real time
- [ ] Total execution time is distributed (not all at end)

### TC-9.5: Cancel and Rollback
- [ ] Cancel during execution stops before next step
- [ ] Cancel during AI generation stops cleanly
- [ ] Rollback after partial execution reverts completed steps
- [ ] Files are in correct state after rollback

### TC-9.6: Error Handling
- [ ] If AI fails to generate content for a step, error shown clearly
- [ ] Execution halts on error, remaining steps marked as skipped
- [ ] Rollback available after error

### TC-9.7: Edge Cases
- [ ] Plan with only shell commands -- no AI generation needed
- [ ] Plan with only delete steps -- no AI generation needed
- [ ] Very large file edit -- AI generates correct content
- [ ] 8+ steps in a plan -- all execute incrementally
