# P1-005: Chat UI Component

**Phase:** 1 - Foundation
**Assignee:** FE (Frontend Dev)
**Priority:** Critical
**Dependencies:** P1-004

## Description
Build the core chat interface: message list, input box, and message rendering with markdown support.

## Acceptance Criteria
- [ ] `Chat.tsx` - scrollable message list with auto-scroll to bottom
- [ ] `Input.tsx` - multi-line text input, Shift+Enter for newline, Enter or button to send
- [ ] Messages display with role indicator (User / Assistant)
- [ ] AI messages rendered as markdown using `react-markdown`
- [ ] Code blocks with syntax highlighting (basic, Shiki in Phase 6)
- [ ] Loading indicator while AI is responding (streaming dots or spinner)
- [ ] Empty state with welcome message and example prompts
- [ ] Zustand store (`chatStore.ts`) for message state

## Notes
- Messages format: `{ id, role: "user" | "assistant", content, timestamp }`
- Support streaming: assistant messages update in real-time as deltas arrive
