# BE-P7-005: WebSocket Broadcast on Project Switch

**Phase:** 7 - Project Switching
**Assignee:** BE (Backend Dev)
**Priority:** Medium
**Dependencies:** BE-P7-001

## Description
When a project switch occurs, broadcast a WebSocket event to all connected clients so the UI can react (clear state, refresh file tree, etc.).

## Acceptance Criteria
- [ ] After successful project switch, send `{ type: "project:switched", path: string, name: string }` to all connected WebSocket clients
- [ ] Message is sent to ALL connected clients (supports multiple browser tabs)
- [ ] Message is only sent on successful switch (not on validation failure)

## Technical Notes
- Need to track connected WebSocket clients in `ws-handler.ts` or a shared registry
- The switch endpoint (BE-P7-001) triggers the broadcast after success
- Consider extracting a `broadcast(message)` utility for reuse

## Mock Strategy (for parallel development)
- Test with multiple WS clients connected, verify all receive the event
