# FE-P1-004: React + Vite Frontend Setup

**Phase:** 1 - Foundation
**Assignee:** FE (Frontend Dev)
**Priority:** Critical
**Dependencies:** TL-P1-001

## Description
Scaffold the React frontend with Vite and Tailwind CSS. Create the basic app shell layout.

## Acceptance Criteria
- [ ] Vite config with React plugin, dev proxy to backend
- [ ] Tailwind CSS configured with dark theme support
- [ ] `App.tsx` with main layout: sidebar placeholder + main chat area
- [ ] Basic responsive layout (works on 1024px+)
- [ ] `globals.css` with Tailwind directives and base styles
- [ ] Dev server runs on port 5173, proxies `/api` and `/ws` to backend
- [ ] `pnpm dev` from root starts both backend and frontend

## Notes
- Use Tailwind v4 if stable, otherwise v3
- Dark theme as default
- Monospace font for code areas

## Mock Strategy (for parallel development)
- **Do NOT wait for TL-P1-001 (scaffolding)**
- Develop as standalone Vite project with its own `package.json`
- No backend proxy needed yet — will be configured during TL-P1-014 (integration)
