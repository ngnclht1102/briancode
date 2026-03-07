# BE-P2-002: Agents.md Loader & Watcher

**Phase:** 2 - Context & Tools
**Assignee:** BE (Backend Dev)
**Priority:** High
**Dependencies:** BE-P1-002

## Description
Load `Agents.md` from the project root and inject it into the AI system prompt. Watch for changes and reload automatically.

## Acceptance Criteria
- [ ] `src/context/agents-md.ts` — loads `Agents.md` from project root
- [ ] Returns empty string if file doesn't exist (no error)
- [ ] Watches file with `fs.watch` — reloads on change (debounced 500ms)
- [ ] Emits event when content changes so active sessions pick up updates
- [ ] Content injected into system prompt as:
  ```
  ## Project Instructions (from Agents.md)
  <contents>
  ```
- [ ] Logs on startup: `"Loaded Agents.md (X lines)"` or `"No Agents.md found"`
- [ ] REST endpoint: `GET /api/agents-md` returns current contents (for UI display)

## Notes
- This is the primary way users customize AI behavior per project
- Keep it simple — just read and inject, no parsing or validation

## Mock Strategy (for parallel development)
- Develop as standalone module
- Test with a fixture `Agents.md` file
- Export `getAgentsMd(): string` — others mock with empty string
