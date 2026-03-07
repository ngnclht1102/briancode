# BA-P7-001: Phase 7 Requirements — Project Switching

**Phase:** 7 - Project Switching
**Assignee:** BA (Business Analyst)
**Priority:** High
**Dependencies:** None

## Description
Define and document requirements for the project switching feature, ensuring all user stories and edge cases are covered.

## User Stories
1. As a user, I want to switch to a different project folder from the UI so I don't have to restart the server
2. As a user, I want to see which project I'm currently working on in the status bar
3. As a user, I want to quickly switch back to a recent project from a list
4. As a user, I want to type a path manually to open any project on my machine
5. As a user, I want stale/deleted projects clearly indicated so I don't try to open them

## Acceptance Criteria (feature-level)
- [ ] Current project name always visible in UI
- [ ] Project switcher accessible via click and keyboard shortcut
- [ ] Recent projects list persists across server restarts
- [ ] Switching resets all project-specific state (chat, plan, file tree)
- [ ] Invalid paths show clear error messages
- [ ] Multiple browser tabs stay in sync after switch

## Edge Cases to Document
- [ ] Switching to a path that is a file, not a directory
- [ ] Switching to a path with no read permissions
- [ ] Switching to a very large project (many files)
- [ ] Switching while an execution is in progress
- [ ] Path with special characters or spaces
- [ ] Relative paths and `~` expansion
