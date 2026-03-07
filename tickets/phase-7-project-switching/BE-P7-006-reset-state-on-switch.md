# BE-P7-006: Reset Server State on Project Switch

**Phase:** 7 - Project Switching
**Assignee:** BE (Backend Dev)
**Priority:** High
**Dependencies:** BE-P7-001

## Description
When switching projects, all server-side state tied to the previous project must be reset to avoid stale data leaking into the new project context.

## Acceptance Criteria
- [ ] File tree cache invalidated (already done by `setProjectRoot()`)
- [ ] Context builder baseline context cleared/rebuilt for new project
- [ ] Change tracker history cleared (changes from old project are irrelevant)
- [ ] Chat session history cleared (conversation was about old project)
- [ ] Agents.md reloaded from new project root
- [ ] All resets happen atomically as part of the switch operation

## Technical Notes
- `invalidateCache()` in workspace.ts handles file tree
- `clearChangeHistory()` needed in change-tracker.ts (may need to add)
- Chat history reset: clear the in-memory conversation messages array
- Context builder: force re-read of Agents.md, git info, config files from new root

## Mock Strategy (for parallel development)
- Create a `resetProjectState()` function that calls all reset functions
- Test by verifying each subsystem returns fresh state after reset
