# BE-P7-002: GET /api/project/current Endpoint

**Phase:** 7 - Project Switching
**Assignee:** BE (Backend Dev)
**Priority:** High
**Dependencies:** None

## Description
Create a REST endpoint that returns the current active project directory information so the UI can display it.

## Acceptance Criteria
- [ ] `GET /api/project/current` returns `{ path: string, name: string }`
- [ ] `path` is the absolute path to the current project root
- [ ] `name` is the basename of the directory (e.g., "brian-code" for `/Users/me/Work/brian-code`)
- [ ] Works immediately on server startup (returns initial `process.cwd()` based root)
- [ ] Returns updated values after a project switch

## Technical Notes
- Uses `getProjectRoot()` from `context/workspace.ts`
- `name` is derived via `path.basename()`

## Mock Strategy (for parallel development)
- Standalone endpoint, no mocks needed
