# P2-004: AI Tool — search_files

**Phase:** 2 - Context & Tools
**Assignee:** BE (Backend Dev)
**Priority:** Critical
**Dependencies:** P2-001

## Description
Implement the `search_files` tool that the AI can call to grep across project files.

## Acceptance Criteria
- [ ] `src/context/search.ts` — searches file contents using regex or string match
- [ ] Tool definition:
  ```
  name: "search_files"
  params: { query: string, glob?: string }
  ```
- [ ] Default glob: `**/*` (all files), user can narrow (e.g., `**/*.ts`)
- [ ] Respects `.gitignore` (reuse workspace scanner's ignore patterns)
- [ ] Returns max 20 matches, each with: file path, line number, matching line, 2 lines of surrounding context
- [ ] Case-insensitive by default
- [ ] If >20 matches: append `"... and N more matches. Narrow your search with a glob pattern."`
- [ ] Register tool in provider's tool list

## Notes
- Use simple string search, not full regex (safer, faster)
- Skip binary files
- Performance target: <2s for typical project
