# AQA-P2-011: E2E Tests — Phase 2 Context & Tools

**Phase:** 2 - Context & Tools
**Assignee:** AQA (Automation QA)
**Priority:** High
**Dependencies:** BE-P2-006, FE-P2-008, AQA-P1-011

## Description
Write Playwright E2E tests for context gathering, AI tool calls, and Agents.md integration.

## Test Specs

### `tests/tool-calls.spec.ts`
```
- should display tool call block when AI reads a file
- should show spinner during tool execution
- should show tool result when expanded
- should display multiple sequential tool calls
- should handle tool call errors gracefully
```

### `tests/context-read-file.spec.ts`
```
- should read file when user asks about it
- should show file contents in tool result
- should truncate large files with line range hint
- should reject path traversal (../) attempts
- should handle non-existent file gracefully
```

### `tests/context-search.spec.ts`
```
- should search files when user asks to find something
- should display matching results with file paths and line numbers
- should handle no results gracefully
```

### `tests/agents-md.spec.ts`
```
- should follow instructions from Agents.md
- should work normally when Agents.md doesn't exist
- should pick up Agents.md changes without restart
```

## Acceptance Criteria
- [ ] All test specs above implemented and passing
- [ ] Test project fixtures: small project with known files for deterministic tests
- [ ] Mock AI provider returns tool_call events for tool-related tests
- [ ] Security tests: path traversal blocked
- [ ] Tests run in <90s total

## Notes
- Create a test fixture project in `packages/e2e/fixtures/test-project/` with known files
- Mock AI to call specific tools so tests are deterministic
- For Agents.md test: create/modify/delete the file during test, verify behavior
