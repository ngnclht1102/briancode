# MQA-P7-001: Manual QA — Phase 7 Project Switching

**Phase:** 7 - Project Switching
**Assignee:** MQA (Manual QA)
**Priority:** High
**Dependencies:** TL-P7-001

## Description
Manual testing for all project switching functionality.

## Test Cases

### TC-7.1: Project Name in Status Bar
- [ ] Current project folder name visible in status bar on load
- [ ] Name updates after switching projects
- [ ] Clicking project name opens switcher modal
- [ ] Long project names truncated with ellipsis

### TC-7.2: Project Switcher Modal
- [ ] Modal opens via status bar click
- [ ] Modal opens via Cmd/Ctrl+O
- [ ] Shows current project path
- [ ] Shows recent projects list
- [ ] Manual path input field present
- [ ] Escape key closes modal
- [ ] Backdrop click closes modal

### TC-7.3: Switch via Manual Path
- [ ] Enter valid directory path → switch succeeds, modal closes
- [ ] Enter path with `~` → expands correctly, switch succeeds
- [ ] Enter non-existent path → error message shown
- [ ] Enter file path (not directory) → error message shown
- [ ] Enter empty path → validation error

### TC-7.4: Switch via Recent Projects
- [ ] Click recent project → switches immediately
- [ ] Non-existent project dimmed/disabled
- [ ] Remove button removes entry from list
- [ ] Current project highlighted in list
- [ ] List ordered by most recently opened

### TC-7.5: State Reset After Switch
- [ ] Chat messages cleared
- [ ] Plan view cleared
- [ ] Execution progress cleared
- [ ] File tree sidebar refreshed with new project files
- [ ] Context/AI aware of new project (send a message, verify)

### TC-7.6: Multi-Tab Sync
- [ ] Open two browser tabs
- [ ] Switch project in tab 1
- [ ] Tab 2 automatically updates (project name, file tree, chat cleared)

### TC-7.7: Recent Projects Persistence
- [ ] Switch between 3 projects
- [ ] Restart server
- [ ] Recent list still shows all 3 projects
- [ ] Order is correct (most recent first)

### TC-7.8: Edge Cases
- [ ] Switch during active AI chat → handled gracefully
- [ ] Path with spaces works correctly
- [ ] Very large project (1000+ files) → file tree loads without crash
