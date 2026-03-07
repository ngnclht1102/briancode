# TL-P7-002: Tech Lead Code Review — Phase 7

**Phase:** 7 - Project Switching
**Assignee:** TL (Tech Lead)
**Priority:** High
**Dependencies:** TL-P7-001

## Description
Review all Phase 7 code for security, correctness, and consistency.

## Review Checklist
- [ ] Path validation: no directory traversal, symlink attacks, or access to sensitive dirs
- [ ] `~` expansion is correct and secure
- [ ] State reset is complete — no stale data leaks between projects
- [ ] WebSocket broadcast is reliable for all connected clients
- [ ] Recent projects persistence handles corrupted config gracefully
- [ ] Error messages don't leak filesystem information
- [ ] Frontend handles all error states from API
- [ ] No race conditions during switch (e.g., file tree loading while switch in progress)
- [ ] Code follows existing patterns and conventions
- [ ] No unnecessary dependencies added
