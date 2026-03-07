# P1-011: E2E Test Infrastructure Setup (Playwright)

**Phase:** 1 - Foundation
**Assignee:** AQA (Automation QA)
**Priority:** Critical
**Dependencies:** P1-001

## Description
Set up the Playwright test infrastructure for automated browser-based E2E testing.

## Acceptance Criteria
- [ ] `packages/e2e/` package in pnpm workspace
- [ ] Playwright installed and configured (`playwright.config.ts`)
- [ ] Browsers: Chromium, Firefox, WebKit
- [ ] Test helpers:
  - `startServer()` — starts backend + serves frontend before tests
  - `stopServer()` — cleanup after tests
  - `waitForWebSocket()` — waits for WS connection to be established
- [ ] Global setup: start server, global teardown: stop server
- [ ] Base test fixture: `brianPage` that navigates to app and waits for ready state
- [ ] `pnpm test:e2e` script in root package.json
- [ ] CI-ready: headless mode by default, headed via `--headed` flag
- [ ] Screenshot on failure (auto-captured by Playwright)
- [ ] Test report: HTML reporter configured

## Project Structure
```
packages/e2e/
├── package.json
├── playwright.config.ts
├── fixtures/
│   └── brian-fixture.ts    # Custom test fixtures
├── helpers/
│   ├── server.ts           # Start/stop test server
│   └── ws.ts               # WebSocket test helpers
└── tests/
    └── (test files per phase)
```

## Notes
- Use Playwright's built-in web server option in config to auto-start the app
- Tests run against a real browser — this is true E2E
