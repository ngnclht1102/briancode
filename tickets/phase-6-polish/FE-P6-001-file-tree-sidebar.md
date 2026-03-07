# FE-P6-001: File Tree Sidebar

**Phase:** 6 - Polish
**Assignee:** FE (Frontend Dev)
**Priority:** Medium
**Dependencies:** BE-P2-001

## Description
Add a collapsible file tree sidebar showing the project structure. Users can click files to view them or add them to context.

## Acceptance Criteria
- [ ] `FileTree.tsx` — tree view component with expand/collapse
- [ ] Loads file tree from `GET /api/files`
- [ ] File/folder icons by type
- [ ] Click file → sends to chat as context ("I'm looking at src/App.tsx")
- [ ] Search/filter bar at top
- [ ] Collapsible sidebar (toggle with button or keyboard shortcut)
- [ ] Highlights files modified in current session
- [ ] Responsive: hidden by default on small screens

## Notes
- Keep it lightweight — don't try to be a full file editor
- Lazy-load deep directory contents

## Mock Strategy (for parallel development)
- **Do NOT wait for BE-P2-001 API**
- Mock `GET /api/files` with a hardcoded file tree JSON
- Build expand/collapse, search, click-to-add-context UI against mock data
- Real API wired during TL-P6-011 (integration)
