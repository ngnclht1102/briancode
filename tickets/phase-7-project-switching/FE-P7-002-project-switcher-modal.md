# FE-P7-002: ProjectSwitcher Modal Component

**Phase:** 7 - Project Switching
**Assignee:** FE (Frontend Dev)
**Priority:** Critical
**Dependencies:** None

## Description
Create a modal component for switching between projects. Shows the current project, recent projects list, and a manual path input.

## Acceptance Criteria
- [ ] Modal overlay with backdrop (consistent with Settings modal style)
- [ ] Header: "Switch Project" with close button
- [ ] Current project section: shows full path of active project
- [ ] Recent projects section: list of recent projects (from FE-P7-003)
- [ ] Manual input section: text field for entering a path + "Switch" button
- [ ] Path input supports `~` expansion (display hint)
- [ ] "Switch" button calls `POST /api/project/switch` with entered path
- [ ] On success: closes modal, triggers state refresh
- [ ] On error: shows inline error message (e.g., "Directory not found")
- [ ] Loading state while switch is in progress
- [ ] Escape key closes the modal

## Technical Notes
- Follow existing modal pattern from `Settings.tsx`
- New file: `components/ProjectSwitcher.tsx`
- Wire into App.tsx with `showProjectSwitcher` state

## Mock Strategy (for parallel development)
- Mock `POST /api/project/switch` response
- Hardcode 3-4 sample recent projects
