# TL-P1-014: Integration — Phase 1 Foundation

**Phase:** 1 - Foundation
**Assignee:** TL (Tech Lead)
**Priority:** Critical
**Dependencies:** TL-P1-001, BE-P1-002, BE-P1-003, FE-P1-004, FE-P1-005, FE-P1-006, BE-P1-007

## Description
Integrate all Phase 1 components built in parallel with mocks into a working end-to-end system. Replace mocks with real implementations.

## Integration Tasks

### 1. Workspace Integration
- [ ] Merge standalone server and web packages into yarn workspace (TL-P1-001)
- [ ] Ensure `yarn dev` starts both backend and frontend
- [ ] Configure Vite proxy to forward `/api` and `/ws` to Fastify

### 2. WebSocket Wiring
- [ ] Replace mock WebSocket server in FE-P1-006 with real Fastify WebSocket (BE-P1-002)
- [ ] Verify connection status, reconnection, and message passing
- [ ] Ensure message format contract matches between FE and BE

### 3. Provider Wiring
- [ ] Connect real DeepSeek provider (BE-P1-007) to WebSocket handler (BE-P1-002)
- [ ] Replace mock streaming responses with real AI streaming
- [ ] Verify streaming deltas flow: DeepSeek API → server → WebSocket → Chat UI

### 4. Chat Flow Wiring
- [ ] User message from Input (FE-P1-005) → WebSocket (FE-P1-006) → server (BE-P1-002) → DeepSeek (BE-P1-007) → stream back → Chat UI
- [ ] Verify multi-turn conversation (history maintained)
- [ ] Error paths: invalid API key, network failure, server error

### 5. CLI Wiring
- [ ] Connect CLI (BE-P1-003) to start real server with correct config
- [ ] Verify browser auto-open points to correct URL
- [ ] `brian-code` command starts everything correctly

## Acceptance Criteria
- [ ] `yarn dev` starts both server and frontend
- [ ] Browser connects via WebSocket, status shows "Connected"
- [ ] User sends message, AI response streams in real-time
- [ ] Multi-turn chat works
- [ ] `brian-code` CLI starts server and opens browser
- [ ] All mock implementations removed or replaced

## Notes
- This is the "glue" ticket — no new features, just wiring
- If integration reveals contract mismatches, fix them here
- Replaces TL-P1-008 (which was the original e2e flow ticket)
