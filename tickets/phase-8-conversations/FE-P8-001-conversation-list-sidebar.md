# FE-P8-001: Conversation List Sidebar Panel

**Phase:** 8 - Conversation Management
**Assignee:** FE (Frontend Dev)
**Priority:** Critical
**Dependencies:** None

## Description
Add a conversation history panel to the sidebar, showing past conversations for the current project.

## Acceptance Criteria
- [ ] New "History" section in the file tree sidebar, or a separate tab/toggle between Files and History
- [ ] Fetches conversations from `GET /api/history` (filtered by current project)
- [ ] Each entry shows: title (truncated), relative time (e.g., "2 hours ago"), message count
- [ ] List sorted by most recent first
- [ ] Refreshes when sidebar becomes visible
- [ ] Refreshes after new conversation created or conversation deleted
- [ ] Empty state: "No conversations yet"
- [ ] Scrollable list for many conversations

## Technical Notes
- Could be a tab toggle at the top of the sidebar: "Files | History"
- Or a collapsible section below the file tree
- Use relative time formatting (e.g., `Intl.RelativeTimeFormat` or simple helper)

## Mock Strategy
- Hardcode sample conversation entries for initial development
