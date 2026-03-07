# BE-P7-004: GET /api/project/recent Endpoint

**Phase:** 7 - Project Switching
**Assignee:** BE (Backend Dev)
**Priority:** High
**Dependencies:** BE-P7-003

## Description
Create a REST endpoint that returns the list of recent projects for the UI's project switcher modal.

## Acceptance Criteria
- [ ] `GET /api/project/recent` returns `{ projects: RecentProject[] }`
- [ ] Each project includes `{ path, name, lastOpened, exists }` fields
- [ ] `exists` is a boolean indicating whether the directory still exists on disk
- [ ] List is ordered by most recently opened first
- [ ] Returns empty array if no recent projects

## Technical Notes
- Reads from the recent projects list maintained by BE-P7-003
- `exists` check done at request time via `fs.existsSync()`

## Mock Strategy (for parallel development)
- Seed config with sample recent projects for testing
