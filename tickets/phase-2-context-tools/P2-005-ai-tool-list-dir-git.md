# P2-005: AI Tools — list_directory & read_git_diff

**Phase:** 2 - Context & Tools
**Assignee:** BE (Backend Dev)
**Priority:** High
**Dependencies:** P2-001

## Description
Implement remaining AI tools: `list_directory` for browsing folders and `read_git_diff` for seeing changes.

## Acceptance Criteria
- [ ] `list_directory` tool:
  - Params: `{ path: string }`
  - Returns files and folders in the directory with type indicators
  - Format: `"dir/  file.ts  file.css"` (one per line, dirs end with `/`)
  - Security: reject paths outside project root
- [ ] `read_git_diff` tool:
  - `src/context/git.ts` — runs git commands via `child_process`
  - Params: `{ staged?: boolean }`
  - Returns `git diff` (unstaged) or `git diff --staged`
  - Also includes `git status --short` summary at top
  - Returns `"Not a git repository"` if no `.git` folder
- [ ] Both tools registered in provider's tool list

## Notes
- `git.ts` will also be used later for baseline context (git status)
- Use `execFile` not `exec` for safety (no shell injection)
