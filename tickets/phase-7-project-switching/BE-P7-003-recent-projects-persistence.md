# BE-P7-003: Recent Projects Persistence

**Phase:** 7 - Project Switching
**Assignee:** BE (Backend Dev)
**Priority:** High
**Dependencies:** BE-P7-001

## Description
Track recently opened projects in the global config file so users can quickly switch back to previous projects.

## Acceptance Criteria
- [ ] Store recent projects in `~/.brian-code/config.json` under `recentProjects` key
- [ ] Each entry contains `{ path: string, name: string, lastOpened: string (ISO date) }`
- [ ] List is ordered by most recently opened first
- [ ] Maximum 10 entries — oldest is dropped when limit exceeded
- [ ] Duplicate paths are moved to top (not duplicated)
- [ ] Current project at startup (`process.cwd()`) is added to recent list
- [ ] Every successful project switch updates the list
- [ ] Persists across server restarts

## Technical Notes
- Extend `config.ts` to handle `recentProjects` array
- Use `saveConfig()` to persist changes
- On load, filter out entries where `path` no longer exists on disk (optional: keep but flag)

## Mock Strategy (for parallel development)
- Test by reading/writing config file directly
- No dependency on switch endpoint — call tracking function directly
