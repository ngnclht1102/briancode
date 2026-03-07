# BE-P2-003: AI Tool — read_file

**Phase:** 2 - Context & Tools
**Assignee:** BE (Backend Dev)
**Priority:** Critical
**Dependencies:** BE-P1-007

## Description
Implement the `read_file` tool that the AI can call to read file contents on demand.

## Acceptance Criteria
- [ ] `src/context/file-reader.ts` — reads files with optional line ranges
- [ ] Tool definition:
  ```
  name: "read_file"
  params: { path: string, startLine?: number, endLine?: number }
  ```
- [ ] Returns file contents with line numbers
- [ ] Large files (>500 lines): if no range specified, return first 200 lines + `"... (truncated, X more lines. Use startLine/endLine to read more)"`
- [ ] Security: resolve path relative to project root, reject `..` traversal
- [ ] Binary files: return `"[Binary file, N bytes]"` instead of contents
- [ ] File not found: return clear error message
- [ ] Register tool in provider's tool list

## Notes
- Line numbers help the AI reference specific locations
- Path should be relative to project root (e.g., `src/App.tsx`, not absolute)

## Mock Strategy (for parallel development)
- Develop as standalone module, test by reading real files from a fixture dir
- Export tool definition + handler function independently
- Tool handler loop (BE-P2-006) will mock this with canned file contents until integration
