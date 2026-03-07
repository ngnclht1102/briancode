# AQA-P7-001: E2E Tests — Phase 7 Project Switching

**Phase:** 7 - Project Switching
**Assignee:** AQA (Automation QA)
**Priority:** High
**Dependencies:** TL-P7-001

## Description
Playwright E2E tests covering project switching flows.

## Test Scenarios

### E2E-7.1: Open Project Switcher
- Navigate to app
- Click project name in status bar
- Assert modal is visible with "Switch Project" heading
- Assert current project path displayed
- Press Escape → modal closes

### E2E-7.2: Switch Project via Path Input
- Open project switcher
- Type a valid directory path in input
- Click "Switch" button
- Assert modal closes
- Assert status bar shows new project name
- Assert file tree (if visible) shows files from new project

### E2E-7.3: Invalid Path Error
- Open project switcher
- Type `/nonexistent/path/12345`
- Click "Switch"
- Assert error message visible in modal
- Assert modal stays open

### E2E-7.4: Recent Projects Display
- Switch to project A, then project B
- Open project switcher
- Assert recent list contains both A and B
- Assert B appears before A (more recent)

### E2E-7.5: State Reset on Switch
- Send a chat message
- Switch to a different project
- Assert chat is empty
- Assert no plan or execution state visible

### E2E-7.6: Keyboard Shortcut
- Press Cmd/Ctrl+O
- Assert project switcher modal opens

## Technical Notes
- Create temp directories in test setup for switch targets
- Clean up temp directories in teardown
- Use `page.keyboard` for shortcut testing
