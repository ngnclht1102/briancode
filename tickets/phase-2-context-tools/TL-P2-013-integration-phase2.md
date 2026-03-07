# TL-P2-013: Integration — Phase 2 Context & Tools

**Phase:** 2 - Context & Tools
**Assignee:** TL (Tech Lead)
**Priority:** Critical
**Dependencies:** BE-P2-001 through BE-P2-007, FE-P2-008

## Description
Integrate all Phase 2 context and tool modules into the working Phase 1 system. Wire the agentic tool-use loop, context builder, and tool call UI.

## Integration Tasks

### 1. Tool Registration
- [ ] Register all tools (read_file, search_files, list_directory, read_git_diff) in the tool handler
- [ ] Connect tool handler to the WebSocket chat handler
- [ ] Verify tool definitions are sent to AI provider correctly

### 2. Agentic Loop Wiring
- [ ] Connect the tool-use loop (BE-P2-006) with real AI provider
- [ ] AI calls tool → tool handler executes → result returned to AI → AI continues
- [ ] Verify multi-turn tool calls work (AI calls 3+ tools in sequence)
- [ ] Replace mock tool responses with real file/search/git operations

### 3. Context Builder Wiring
- [ ] Connect workspace scanner (BE-P2-001) to context builder (BE-P2-007)
- [ ] Connect Agents.md loader (BE-P2-002) to system prompt
- [ ] Verify baseline context (file tree + config + git + Agents.md) included in every request
- [ ] Token budget enforcement works with real project

### 4. Frontend Tool Display
- [ ] Connect tool call WebSocket events to frontend tool call UI (FE-P2-008)
- [ ] Verify tool calls show spinner → result → collapsible block
- [ ] Verify tool calls appear inline in chat stream

### 5. End-to-End Verification
- [ ] User asks about a file → AI calls read_file → shows result → responds
- [ ] User asks to find something → AI calls search_files → finds it → responds
- [ ] Agents.md instructions followed in AI responses
- [ ] Tool calls visible in UI during AI thinking

## Acceptance Criteria
- [ ] AI autonomously reads files and searches when needed
- [ ] Tool call results displayed in UI
- [ ] Agents.md rules respected
- [ ] Baseline context included in all requests
- [ ] No mock tool responses remaining

## Notes
- Test with a real project (not just test fixtures)
- Pay attention to latency — each tool call is an extra AI round trip
