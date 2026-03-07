# FE-P1-006: WebSocket Connection Hook

**Phase:** 1 - Foundation
**Assignee:** FE (Frontend Dev)
**Priority:** Critical
**Dependencies:** FE-P1-004, BE-P1-002

## Description
Create the `useWebSocket` hook that manages the WebSocket connection between frontend and backend.

## Acceptance Criteria
- [ ] `useWebSocket.ts` hook with auto-connect on mount
- [ ] Auto-reconnect on disconnect (exponential backoff, max 5 retries)
- [ ] Connection status exposed: `connecting`, `connected`, `disconnected`
- [ ] `sendMessage(type, payload)` function for sending typed messages
- [ ] Message handler registry: components subscribe to specific message types
- [ ] `StatusBar.tsx` component showing connection status and current model
- [ ] Handle incoming `chat:stream` deltas — append to current assistant message
- [ ] Handle `chat:done` — mark message as complete

## Notes
- WebSocket URL: `ws://localhost:<port>/ws` (auto-detect from window.location)
- All messages are JSON with `type` field per WebSocket protocol in PLAN.md

## Mock Strategy (for parallel development)
- **Do NOT wait for BE-P1-002 (server)**
- Mock WebSocket server: use `ws` npm package to create a simple echo server in a test script
- Or use a mock WebSocket class that simulates connect/disconnect/messages
- Test reconnection logic with the mock
- Real Fastify WebSocket will be wired during TL-P1-014 (integration)
