# AQA-P1-012: E2E Tests — Phase 1 Foundation

**Phase:** 1 - Foundation
**Assignee:** AQA (Automation QA)
**Priority:** High
**Dependencies:** TL-P1-008, AQA-P1-011

## Description
Write Playwright E2E tests covering all Phase 1 features: app load, chat UI, WebSocket, and AI chat flow.

## Test Specs

### `tests/app-load.spec.ts`
```
- should load the app without errors
- should display welcome/empty state
- should show "Connected" in status bar
- should have focused input box
```

### `tests/chat-input.spec.ts`
```
- should send message on Enter key
- should not send empty message
- should insert newline on Shift+Enter
- should clear input after sending
- should display sent message in chat with User role
- should handle multi-line messages
```

### `tests/chat-ai.spec.ts`
```
- should stream AI response after sending message
- should display AI response with Assistant role
- should render markdown in AI response (bold, code blocks)
- should show loading indicator while AI responds
- should maintain multi-turn conversation context
- should display error on invalid API key
```

### `tests/websocket.spec.ts`
```
- should show Connected status on load
- should show Disconnected when server stops
- should reconnect automatically when server restarts
- should show error when sending while disconnected
```

## Acceptance Criteria
- [ ] All test specs above implemented and passing
- [ ] Tests run in <60s total
- [ ] Tests work in headless mode (CI-ready)
- [ ] Mock AI provider for deterministic responses (no real API calls in CI)
- [ ] Screenshot captured on each failure

## Notes
- Use Playwright's `page.waitForSelector` and `page.waitForResponse` for async flows
- Mock the AI provider with a test double that returns canned streaming responses
- WebSocket reconnect test: kill and restart server process
