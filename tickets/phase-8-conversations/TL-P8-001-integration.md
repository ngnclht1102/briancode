# TL-P8-001: Integration -- Phase 8

**Phase:** 8 - Conversation Management
**Assignee:** TL (Tech Lead)
**Priority:** Critical
**Dependencies:** BE-P8-001 through BE-P8-005, FE-P8-001 through FE-P8-005

## Description
Wire all Phase 8 components together into a complete conversation management system.

## Integration Checklist
- [ ] History module wired into chat handler (messages auto-saved)
- [ ] All new API endpoints registered in router.ts
- [ ] Conversation list panel integrated into sidebar
- [ ] Load conversation flow: click history -> load messages -> resume chat
- [ ] Delete conversation flow: click delete -> confirm -> remove
- [ ] New chat flow: button/shortcut -> backend reset -> frontend clear -> list refresh
- [ ] Project switch resets active conversation
- [ ] Conversation ID tracked across frontend/backend
- [ ] Verify conversations persist across server restarts
- [ ] Verify project filtering works after switching projects
- [ ] Test with 20+ conversations for performance

## Notes
- Ensure conversation history doesn't bloat the AI context (consider summarization for long conversations)
- Large conversations may need pagination when loading messages
