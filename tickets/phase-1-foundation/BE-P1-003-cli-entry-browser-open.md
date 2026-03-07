# BE-P1-003: CLI Entry Point & Browser Auto-Open

**Phase:** 1 - Foundation
**Assignee:** BE (Backend Dev)
**Priority:** High
**Dependencies:** BE-P1-002

## Description
Create the CLI entry point (`brian-code` command) that parses args, starts the server, and opens the browser.

## Acceptance Criteria
- [ ] `bin/brian.js` shim that runs the compiled CLI
- [ ] `src/cli.ts` using `commander` for arg parsing
- [ ] Supported flags: `--port <number>`, `--no-open` (skip browser)
- [ ] Starts Fastify server on specified port
- [ ] Auto-opens `http://localhost:<port>` in default browser via `open` package
- [ ] Prints startup banner: `Brian Code v0.1.0 - http://localhost:3000`
- [ ] `package.json` `bin` field configured for global install

## Notes
- Use `open` npm package for cross-platform browser opening
- Detect if port is already in use and suggest next available

## Mock Strategy (for parallel development)
- **Do NOT wait for BE-P1-002 (server)**
- Mock server start: use a minimal HTTP server placeholder that returns 200
- Focus on arg parsing, port detection, browser open logic
- Real server will be wired during TL-P1-014 (integration)
