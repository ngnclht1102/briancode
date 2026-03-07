# FE-P2-008: Tool Calls Display in UI

**Phase:** 2 - Context & Tools
**Assignee:** FE (Frontend Dev)
**Priority:** High
**Dependencies:** FE-P1-006, BE-P2-006

## Description
Display AI tool calls in the chat UI so the user can see what the AI is reading/searching.

## Acceptance Criteria
- [ ] Handle `chat:tool_call` WebSocket events in chat store
- [ ] Display tool calls inline in the message stream as collapsible blocks:
  - Icon + label: "Reading src/App.tsx" / "Searching for 'login'" / "Listing src/pages/"
  - Collapsed by default, expandable to see full tool result
- [ ] Handle `chat:tool_result` events — attach result to the corresponding tool call
- [ ] Show spinner on tool call until result arrives
- [ ] Multiple sequential tool calls displayed in order
- [ ] Style: muted/secondary visual treatment (not as prominent as chat messages)

## Notes
- Keep it minimal — users want to see what's happening but not be overwhelmed
- Similar to how Claude Code shows "Read file", "Search" operations

## Mock Strategy (for parallel development)
- **Do NOT wait for BE-P2-006 (tool handler)**
- Mock WebSocket events: dispatch fake `chat:tool_call` and `chat:tool_result` events
- Build and test the collapsible UI blocks with mock data
- Real tool call events wired during TL-P2-013 (integration)
