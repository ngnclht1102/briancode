# TL-P10-002: Tech Lead Code Review — Phase 10

**Phase:** 10 - File Mentions & Attachments
**Assignee:** TL (Tech Lead)
**Priority:** High
**Dependencies:** TL-P10-001

## Review Checklist

### Security
- [ ] File mention paths validated against project root (no path traversal via `@../../etc/passwd`)
- [ ] Upload file size limits enforced server-side (not just client-side)
- [ ] MIME type validated on server (content sniffing, not just extension)
- [ ] Base64 image data validated before forwarding to provider
- [ ] No user-supplied content injected into system prompt unsanitized
- [ ] Temp files cleaned up (or confirm no temp files created)

### Performance
- [ ] Large file mentions don't block the event loop
- [ ] Image base64 encoding doesn't cause memory spikes
- [ ] File list for @ mentions is cached (not re-scanned on every keystroke)
- [ ] Popup rendering doesn't cause input lag
- [ ] Conversation history size stays manageable with image data

### Error Handling
- [ ] Graceful handling of unreadable files in mentions
- [ ] Network errors during upload show user-friendly messages
- [ ] Provider errors with multimodal content handled (fallback)
- [ ] Corrupt PDF files handled gracefully

### UX
- [ ] @ mention popup is responsive and doesn't flicker
- [ ] Keyboard navigation feels natural
- [ ] Attachment chips are visually consistent
- [ ] Drop zone indicator is clear
- [ ] Error messages are actionable
