# FE-P7-005: Keyboard Shortcut Cmd/Ctrl+O for Project Switcher

**Phase:** 7 - Project Switching
**Assignee:** FE (Frontend Dev)
**Priority:** Low
**Dependencies:** FE-P7-002

## Description
Add a keyboard shortcut to quickly open the project switcher modal.

## Acceptance Criteria
- [ ] `Cmd+O` (Mac) / `Ctrl+O` (Windows/Linux) opens the ProjectSwitcher modal
- [ ] Prevents default browser "Open File" behavior
- [ ] Shortcut registered in `useKeyboardShortcuts` hook
- [ ] Shortcut listed in ShortcutsHelp modal
- [ ] If modal is already open, shortcut is ignored (no toggle)

## Technical Notes
- Add `onOpenProject` callback to `useKeyboardShortcuts`
- Update `ShortcutsHelp.tsx` with new entry

## Mock Strategy (for parallel development)
- No mocks needed — pure frontend behavior
