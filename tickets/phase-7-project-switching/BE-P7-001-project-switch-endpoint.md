# BE-P7-001: POST /api/project/switch Endpoint

**Phase:** 7 - Project Switching
**Assignee:** BE (Backend Dev)
**Priority:** Critical
**Dependencies:** None

## Description
Create a REST endpoint that allows switching the active project directory at runtime. This is the core backend piece that enables project switching from the UI.

## Acceptance Criteria
- [ ] `POST /api/project/switch` accepts `{ path: string }` in request body
- [ ] Validates that `path` exists on the filesystem
- [ ] Validates that `path` is a directory (not a file)
- [ ] Resolves relative paths to absolute paths
- [ ] Expands `~` to home directory
- [ ] Calls `setProjectRoot(resolvedPath)` from workspace module
- [ ] Returns `{ success: true, path: resolvedPath, name: basename }` on success
- [ ] Returns `{ success: false, error: "..." }` with appropriate message on failure
- [ ] Returns 400 for missing path, non-existent path, or non-directory path

## Technical Notes
- `setProjectRoot()` already exists in `context/workspace.ts` and invalidates the file tree cache
- Need to also trigger broader state reset (see BE-P7-006)
- Path validation must prevent traversal attacks (no symlink following outside allowed dirs)

## Mock Strategy (for parallel development)
- Test with temp directories created in test setup
- No dependency on frontend — test via curl/httpie
