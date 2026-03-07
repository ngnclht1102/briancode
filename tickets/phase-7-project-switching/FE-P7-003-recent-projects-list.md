# FE-P7-003: Recent Projects List in Modal

**Phase:** 7 - Project Switching
**Assignee:** FE (Frontend Dev)
**Priority:** High
**Dependencies:** FE-P7-002

## Description
Implement the recent projects list within the ProjectSwitcher modal, fetched from the backend.

## Acceptance Criteria
- [ ] Fetch recent projects from `GET /api/project/recent` when modal opens
- [ ] Each item shows: folder name (bold), full path (subtle), last opened date
- [ ] Items that no longer exist on disk show a warning indicator (dimmed, strikethrough, or badge)
- [ ] Click on an existing project switches to it immediately
- [ ] Click on a non-existent project shows error / is disabled
- [ ] Remove button (X) on each item to clear from recent list
- [ ] Remove calls `DELETE /api/project/recent/:path` or `POST /api/project/recent/remove`
- [ ] Empty state: "No recent projects" message
- [ ] Current project is highlighted / marked as active

## Technical Notes
- Integrate into ProjectSwitcher modal (FE-P7-002)
- May need a `DELETE` or `POST` endpoint for removing entries (coordinate with BE)

## Mock Strategy (for parallel development)
- Hardcode sample projects array with mix of existing and non-existing paths
