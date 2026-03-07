# TL-P7-001: Integration — Phase 7

**Phase:** 7 - Project Switching
**Assignee:** TL (Tech Lead)
**Priority:** Critical
**Dependencies:** BE-P7-001 through BE-P7-006, FE-P7-001 through FE-P7-005

## Description
Wire all Phase 7 components together: backend endpoints, state reset, WebSocket broadcast, frontend modal, status bar, and keyboard shortcuts.

## Integration Checklist
- [ ] Register all new API routes in `router.ts`
- [ ] Wire `POST /api/project/switch` to call `setProjectRoot()` + `resetProjectState()` + broadcast WS event + update recent projects
- [ ] Wire `GET /api/project/current` and `GET /api/project/recent` endpoints
- [ ] Wire ProjectSwitcher modal into App.tsx
- [ ] Wire project name into StatusBar with click handler
- [ ] Wire `project:switched` WS event in useWebSocket hook
- [ ] Wire keyboard shortcut in useKeyboardShortcuts
- [ ] Verify file tree refreshes after switch
- [ ] Verify chat/plan/execution state clears on switch
- [ ] Verify recent projects list updates after switch
- [ ] Test with multiple browser tabs open

## Notes
- Ensure switch is rejected if an execution is currently in progress
- Add guard: warn user if switching during active chat
