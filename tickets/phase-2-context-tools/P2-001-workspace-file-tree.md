# P2-001: Workspace File Tree Scanning

**Phase:** 2 - Context & Tools
**Assignee:** BE (Backend Dev)
**Priority:** Critical
**Dependencies:** P1-002

## Description
Scan the project directory to build a file tree, respecting `.gitignore`. This provides the AI with a map of the project structure.

## Acceptance Criteria
- [ ] `src/context/workspace.ts` — scans project using `fast-glob`
- [ ] Respects `.gitignore` patterns (use `ignore` or `fast-glob` ignore option)
- [ ] Always excludes: `node_modules`, `.git`, `dist`, `build`, `.next`, `coverage`
- [ ] Returns structured tree: `{ path, type: "file" | "dir", children? }[]`
- [ ] Collapses directories beyond depth 4 into `"dir_name/ (N files)"`
- [ ] Caches result, invalidates on file system changes (debounced `fs.watch`)
- [ ] Serializes to compact string format for AI context (one path per line)
- [ ] REST endpoint: `GET /api/files` returns tree as JSON (for FileTree UI)

## Notes
- Keep the serialized format compact — just paths, no metadata
- Large projects (10K+ files) should still respond in <1s
