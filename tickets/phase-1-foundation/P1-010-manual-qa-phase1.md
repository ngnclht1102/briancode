# P1-010: Manual QA — Phase 1 Foundation

**Phase:** 1 - Foundation
**Assignee:** MQA (Manual QA)
**Priority:** High
**Dependencies:** P1-008

## Description
Manually test all Phase 1 features: server startup, browser auto-open, chat UI, WebSocket connection, and end-to-end chat flow.

## Test Cases

### TC-1.1: Server Startup
- [ ] Run `pnpm dev` — server starts without errors
- [ ] Console shows: port number, URL
- [ ] Server responds to `GET /api/health` with `{ status: "ok" }`
- [ ] Run with `--port 3001` — uses custom port

### TC-1.2: Browser Auto-Open
- [ ] Browser opens automatically on `brian-code` start
- [ ] Correct URL loaded (localhost with correct port)
- [ ] `--no-open` flag prevents browser opening
- [ ] Page loads without console errors

### TC-1.3: Chat UI
- [ ] Chat area renders with welcome message / empty state
- [ ] Input box is focused on load
- [ ] Can type a message
- [ ] Enter sends message
- [ ] Shift+Enter creates newline (does not send)
- [ ] Sent message appears in chat with "User" role
- [ ] Input clears after sending
- [ ] Long messages wrap correctly
- [ ] Chat scrolls to bottom on new message

### TC-1.4: WebSocket Connection
- [ ] StatusBar shows "Connected" after page load
- [ ] Kill server → StatusBar shows "Disconnected"
- [ ] Restart server → auto-reconnects, StatusBar shows "Connected"
- [ ] Send message while disconnected → error shown to user

### TC-1.5: AI Chat (DeepSeek)
- [ ] Send "Hello" → AI response streams in real-time
- [ ] Response renders as markdown (bold, lists, code blocks)
- [ ] Code blocks have copy button or are selectable
- [ ] Multi-turn: ask follow-up referencing previous answer → AI remembers context
- [ ] Send long prompt (500+ chars) → works correctly
- [ ] Loading indicator visible while AI is responding
- [ ] Invalid API key → clear error message shown

### TC-1.6: Edge Cases
- [ ] Rapid-fire 5 messages → no crashes, messages queue correctly
- [ ] Empty message → should not send
- [ ] Very long AI response (1000+ words) → renders without lag
- [ ] Refresh browser → reconnects, chat history cleared (expected for Phase 1)

## Environment
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari

## Bug Report Template
For each bug found, document: steps to reproduce, expected vs actual, screenshot, browser/OS.
