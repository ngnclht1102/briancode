# MQA-P8-001: Manual QA -- Phase 8 Conversation Management

**Phase:** 8 - Conversation Management
**Assignee:** MQA (Manual QA)
**Priority:** High
**Dependencies:** TL-P8-001

## Test Cases

### TC-8.1: Auto-save Conversations
- [ ] Send a message, verify conversation file created in ~/.brian-code/history/
- [ ] Send multiple messages, verify all saved
- [ ] Restart server, verify conversations still listed

### TC-8.2: Conversation List
- [ ] Sidebar shows conversation history for current project
- [ ] Most recent conversation appears first
- [ ] Title matches first user message
- [ ] Message count accurate
- [ ] Relative time displayed correctly

### TC-8.3: Load Conversation
- [ ] Click past conversation -> messages load in chat view
- [ ] Loaded messages render correctly (markdown, code blocks)
- [ ] Can continue chatting after loading
- [ ] AI remembers context from loaded conversation

### TC-8.4: Delete Conversation
- [ ] Delete button visible on conversation entries
- [ ] Confirmation shown before delete
- [ ] Deleted conversation removed from list
- [ ] Deleted conversation file removed from disk
- [ ] Deleting active conversation clears chat view

### TC-8.5: New Conversation
- [ ] "New Chat" button starts fresh conversation
- [ ] Cmd/Ctrl+N starts fresh conversation
- [ ] Previous conversation remains in history
- [ ] New conversation gets its own ID and persists

### TC-8.6: Project Isolation
- [ ] Switch to project A, create conversations
- [ ] Switch to project B, create conversations
- [ ] Switch back to A, only A's conversations shown
- [ ] Switch back to B, only B's conversations shown

### TC-8.7: Edge Cases
- [ ] 20+ conversations — list scrolls properly
- [ ] Very long conversation title — truncated in list
- [ ] Empty conversation (new chat, no messages) — handled gracefully
