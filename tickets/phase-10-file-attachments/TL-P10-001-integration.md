# TL-P10-001: Integration — Phase 10

**Phase:** 10 - File Mentions & Attachments
**Assignee:** TL (Tech Lead)
**Priority:** High
**Dependencies:** All P10 dev tickets

## Description

Wire all Phase 10 components together: frontend mention popup + attachment UI → WebSocket message format → chat handler attachment processing → provider multimodal support.

## Integration Tasks

### 1. Wire @ Mentions to Real File List
- Replace mock file list in `FileMentionPopup` with real data from `/api/files`
- Ensure file paths match between frontend display and backend `resolveProjectPath()`

### 2. Wire Upload Endpoint
- Register `@fastify/multipart` in server setup
- Register `POST /api/upload` route
- Connect frontend PDF upload to the endpoint
- Verify file size limits work end-to-end

### 3. Wire Attachment Payload Through WebSocket
- Ensure `ws-handler.ts` passes full payload (with attachments) to `chatHandler()`
- Verify `chatHandler()` correctly composes the user message with attachments
- Verify conversation history stores the full content (for context continuity)

### 4. Wire Multimodal Through Providers
- Test image messages with Anthropic provider
- Test image messages with OpenAI-compatible provider
- Test image fallback with DeepSeek provider
- Verify tool calls still work when messages contain images

### 5. Wire History
- Ensure attachments are saved/loaded correctly in conversation history
- Image data may be large — consider storing reference only in history, not full base64

### 6. End-to-End Verification
- Send message with @ file mention → AI sees file content
- Send message with PDF attachment → AI sees extracted text
- Send message with image → AI describes/analyzes image
- Send message with mix of all three → all context reaches AI
- Regenerate message with attachments → attachments preserved

## Files to Modify
- `packages/server/src/server/server.ts` — Register multipart
- `packages/server/src/server/router.ts` — Upload route
- `packages/server/src/server/ws-handler.ts` — Pass attachments
- `packages/web/src/App.tsx` — Wire onSend with attachments
- `packages/web/src/hooks/useWebSocket.ts` — Send attachments
- Various provider files as needed

## Acceptance Criteria
- [ ] Full flow works: mention file → AI uses file content
- [ ] Full flow works: upload PDF → AI uses extracted text
- [ ] Full flow works: upload image → AI analyzes image
- [ ] Mixed attachments work in a single message
- [ ] No regression on plain text messages
- [ ] Conversation history handles attachments
- [ ] All three providers handle attachments correctly
