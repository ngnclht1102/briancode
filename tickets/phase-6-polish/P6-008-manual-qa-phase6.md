# P6-008: Manual QA — Phase 6 Polish & Final Regression

**Phase:** 6 - Polish
**Assignee:** MQA (Manual QA)
**Priority:** Critical
**Dependencies:** P6-001 through P6-006

## Description
Final manual testing round covering all polish features and full regression across the entire app.

## Test Cases

### TC-6.1: File Tree Sidebar
- [ ] Sidebar shows project file tree
- [ ] Expand/collapse folders
- [ ] Click file → referenced in chat
- [ ] Search/filter works
- [ ] Toggle sidebar with button / keyboard shortcut
- [ ] Modified files highlighted

### TC-6.2: Syntax Highlighting
- [ ] Code blocks in chat have proper syntax colors
- [ ] TypeScript, JavaScript, Python, CSS, JSON all highlighted
- [ ] Language auto-detected from fence markers
- [ ] Diff view has syntax-highlighted code
- [ ] Line numbers visible

### TC-6.3: Rollback & Undo
- [ ] "Undo" button appears after execution
- [ ] Undo reverts last file change
- [ ] "Rollback" reverts entire plan execution
- [ ] Confirmation dialog before rollback
- [ ] Warning shown for plans with shell commands (can't undo those)

### TC-6.4: Conversation History
- [ ] Previous conversations listed in sidebar/dropdown
- [ ] Click conversation → messages loaded
- [ ] "New Chat" starts fresh
- [ ] History persists after server restart
- [ ] Old conversations auto-cleaned (50 limit)

### TC-6.5: Theme & Keyboard Shortcuts
- [ ] Dark theme renders correctly
- [ ] Light theme renders correctly
- [ ] Toggle between themes
- [ ] Respects system preference on first load
- [ ] Cmd+Enter sends message
- [ ] Cmd+N new chat
- [ ] Cmd+K focuses input
- [ ] Cmd+B toggles sidebar
- [ ] Escape cancels/dismisses
- [ ] Cmd+/ shows shortcuts help

### TC-6.6: Global Install
- [ ] `npm install -g brian-code` completes without errors
- [ ] `brian-code` command available globally
- [ ] Starts server, opens browser, chat works
- [ ] Test on clean machine / fresh Node.js install

### TC-6.7: Full Regression
- [ ] Complete flow: start → chat → plan → execute → verify → undo
- [ ] Test on React project
- [ ] Test on Node.js API project
- [ ] Test on Python project
- [ ] Test on empty project
- [ ] Test on Chrome, Firefox, Safari
- [ ] No console errors throughout
- [ ] Performance: startup <3s, chat stream starts <2s
