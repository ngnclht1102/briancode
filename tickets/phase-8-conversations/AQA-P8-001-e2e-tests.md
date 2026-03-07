# AQA-P8-001: E2E Tests -- Phase 8 Conversation Management

**Phase:** 8 - Conversation Management
**Assignee:** AQA (Automation QA)
**Priority:** High
**Dependencies:** TL-P8-001

## Test Scenarios

### E2E-8.1: Conversation List Visible
- Open sidebar, switch to History tab
- Assert conversation list is visible
- Assert "No conversations yet" shown if empty

### E2E-8.2: Conversation Created on Chat
- Send a message
- Open History panel
- Assert at least one conversation entry exists
- Assert title matches the sent message

### E2E-8.3: Load Conversation
- Create a conversation with 2+ messages
- Start a new chat
- Open History, click the previous conversation
- Assert messages from previous conversation appear in chat

### E2E-8.4: Delete Conversation
- Create a conversation
- Open History panel
- Click delete on the conversation
- Accept confirmation
- Assert conversation removed from list

### E2E-8.5: New Chat
- Send a message (creates conversation)
- Click "New Chat" button
- Assert chat is empty
- Assert previous conversation still in history list

### E2E-8.6: Project Isolation
- In project A, send a message
- Switch to project B
- Open History panel
- Assert project A's conversation not shown

## Technical Notes
- Need to clean up history directory between test runs
- Use API calls to verify backend state alongside UI assertions
