# Brian Code — Project Notes

## Architecture

Monorepo with 3 packages:
- `packages/web` — React + Tailwind frontend (esbuild)
- `packages/server` — Fastify backend with WebSocket chat, tool execution, AI providers (esbuild → single `dist/cli.js`)
- `packages/proxy` — API proxy running on Android device (Fastify, esbuild → single `dist/index.js`)

Build: `yarn build` builds all 3 packages + copies web assets into server.

## Bug Reporting System

Users can report bugs via the "Report" button in the UI. Reports are saved as text files.

### Where bugs are stored
- **With proxy**: `~/.brian-code/bugs/` on the proxy machine (Android)
- **Without proxy**: `~/.brian-code/bugs/` on the server machine (local fallback)

### Proxy bug endpoints
- `GET /bugs` — list all bug reports (returns `{ count, files }`)
- `GET /bugs/:filename` — read a specific bug report (returns `{ filename, content }`)
- `DELETE /bugs/:filename` — delete a bug report

### Server bug endpoint
- `POST /api/bug-report` — collects conversation, server logs, provider info, and forwards to proxy. Falls back to local save if proxy is unavailable.

### Bug report contents
Each report includes:
- User description of the problem
- Provider and model in use
- Current project path
- Full conversation history (messages + tool calls)
- Server logs (recent 300 entries)
- Proxy logs (recent 200 entries)

## Context Management

- Context window limits are tracked per model (see `context-manager.ts`)
- Messages are automatically truncated when approaching the limit — oldest messages dropped first, system prompt always kept
- Duplicate file reads are blocked after 2 reads of the same file (resets after edit)
- Context usage is shown in the StatusBar (progress bar + percentage)
- `GET /api/context` returns current token usage stats
