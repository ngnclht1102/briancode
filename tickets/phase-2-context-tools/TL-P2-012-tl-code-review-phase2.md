# TL-P2-012: Tech Lead Code Review — Phase 2

**Phase:** 2 - Context & Tools
**Assignee:** TL (Tech Lead)
**Priority:** High
**Dependencies:** BE-P2-001 through FE-P2-008

## Description
Review Phase 2 context gathering and tool-use implementation for correctness, security, and performance.

## Review Checklist

### Context Modules
- [ ] `workspace.ts` — file scanning is efficient, cache invalidation correct
- [ ] `file-reader.ts` — line range support works, truncation logic correct
- [ ] `search.ts` — search is fast, results well-formatted
- [ ] `git.ts` — uses `execFile` (not `exec`), handles non-git repos
- [ ] `agents-md.ts` — file watching is debounced, handles missing file
- [ ] `context-builder.ts` — token budget logic is sound

### Tool-Use Loop
- [ ] `tool-handler.ts` — tool registry is clean, extensible
- [ ] Agentic loop in `ws-handler.ts` — handles multi-turn tool calls correctly
- [ ] Max iteration limit prevents infinite loops
- [ ] Tool errors are returned to AI gracefully (not thrown)
- [ ] Tool results are concise (not sending excessive data)

### Security (Critical)
- [ ] Path traversal blocked: `..` in file paths rejected
- [ ] All paths resolved relative to project root
- [ ] Cannot read files outside project directory
- [ ] `execFile` used instead of `exec` for git commands
- [ ] No shell injection vectors in search queries

### Performance
- [ ] File tree scan <1s on 5000-file project
- [ ] File read <100ms
- [ ] Search <2s on typical project
- [ ] Token counting is reasonable (doesn't need to be exact)

### Frontend
- [ ] Tool call UI blocks are clean and non-intrusive
- [ ] Collapsible sections work correctly
- [ ] Loading states shown during tool execution

## Deliverables
- [ ] Security audit report (mandatory sign-off)
- [ ] Performance benchmarks
- [ ] Required fixes and suggestions
- [ ] Approve or request changes
