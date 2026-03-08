# BE-P1-002: Fastify Server with WebSocket

**Phase:** 1 - Foundation
**Assignee:** BE (Backend Dev)
**Priority:** Critical
**Dependencies:** TL-P1-001

## Description
Set up Fastify HTTP server with WebSocket support. The server serves the static frontend and handles real-time communication.

## Acceptance Criteria
- [ ] Fastify server starts on configurable port (default 3000)
- [ ] `@fastify/websocket` integrated for WebSocket connections
- [ ] `@fastify/static` serves built frontend from `packages/web/dist`
- [ ] WebSocket handler accepts connections and echoes messages (placeholder)
- [ ] Basic REST endpoint: `GET /api/health` returns `{ status: "ok" }`
- [ ] CORS configured for dev mode (Vite on different port)
- [ ] Graceful shutdown on SIGINT/SIGTERM
- [ ] `src/server/server.ts` and `src/server/ws-handler.ts` created

## Notes
- In dev mode, frontend runs on Vite dev server (port 5173), so CORS needed
- In production, server serves static files directly

## Mock Strategy (for parallel development)
- **Do NOT wait for TL-P1-001 (scaffolding)**
- Develop as standalone Node.js project with its own `package.json`
- Mock WebSocket client: write simple test script that connects and sends messages
- Will be merged into yarn workspace during TL-P1-014 (integration)
