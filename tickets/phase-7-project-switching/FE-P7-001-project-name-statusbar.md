# FE-P7-001: Project Name in StatusBar

**Phase:** 7 - Project Switching
**Assignee:** FE (Frontend Dev)
**Priority:** High
**Dependencies:** None

## Description
Display the current project folder name in the StatusBar component. Clicking it opens the project switcher modal.

## Acceptance Criteria
- [ ] Project folder name shown in the status bar (e.g., "brian-code")
- [ ] Displayed between the hamburger menu and the app title, or replacing the app title
- [ ] Clickable — opens the ProjectSwitcher modal (FE-P7-002)
- [ ] Shows folder icon or project icon before the name
- [ ] Updates when project is switched (via WS event or prop change)
- [ ] Truncates long names with ellipsis

## Technical Notes
- Fetch initial project name from `GET /api/project/current` on mount
- Add `onProjectClick` callback prop to StatusBar
- Update `StatusBarProps` interface

## Mock Strategy (for parallel development)
- Hardcode project name as "my-project" initially
- Wire to real API during integration
