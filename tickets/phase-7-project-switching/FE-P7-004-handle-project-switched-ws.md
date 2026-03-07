# FE-P7-004: Handle project:switched WebSocket Event

**Phase:** 7 - Project Switching
**Assignee:** FE (Frontend Dev)
**Priority:** High
**Dependencies:** FE-P7-001

## Description
When the backend broadcasts a `project:switched` event via WebSocket, the frontend must reset all project-specific state and refresh.

## Acceptance Criteria
- [ ] Listen for `{ type: "project:switched", path, name }` in `useWebSocket` hook
- [ ] On receive: clear all chat messages (chatStore)
- [ ] On receive: clear plan state (planStore)
- [ ] On receive: reset execution state (executionStore)
- [ ] On receive: update project name in StatusBar
- [ ] On receive: refresh file tree sidebar (if visible)
- [ ] On receive: close ProjectSwitcher modal if open
- [ ] Works across multiple browser tabs (all tabs update)

## Technical Notes
- Add handler in `useWebSocket.ts` for the new event type
- May need to expose a `resetAll()` function or call individual store resets
- Similar to `handleNewChat` but also updates project context

## Mock Strategy (for parallel development)
- Simulate WS event via browser console or test harness
