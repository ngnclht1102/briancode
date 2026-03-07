# P6-005: Dark/Light Theme & Keyboard Shortcuts

**Phase:** 6 - Polish
**Assignee:** FE (Frontend Dev)
**Priority:** Medium
**Dependencies:** P1-004

## Description
Add theme switching and keyboard shortcuts for power users.

## Acceptance Criteria
- [ ] Dark theme (default) and light theme
- [ ] Toggle button in StatusBar
- [ ] Respects system preference on first load (`prefers-color-scheme`)
- [ ] Persisted in localStorage
- [ ] Keyboard shortcuts:
  - `Cmd/Ctrl + Enter` — send message
  - `Cmd/Ctrl + N` — new chat
  - `Cmd/Ctrl + K` — focus chat input
  - `Cmd/Ctrl + B` — toggle file tree sidebar
  - `Escape` — cancel current operation / dismiss plan
- [ ] Shortcuts displayed in a help modal (`Cmd/Ctrl + /`)

## Notes
- Use Tailwind's dark mode class strategy
- Keep shortcuts non-conflicting with browser defaults
