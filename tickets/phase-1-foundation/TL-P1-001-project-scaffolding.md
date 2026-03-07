# TL-P1-001: Project Scaffolding & pnpm Workspace Setup

**Phase:** 1 - Foundation
**Assignee:** TL (Tech Lead)
**Priority:** Critical
**Dependencies:** None

## Description
Initialize the monorepo with pnpm workspaces. Set up root config, TypeScript, and the two packages (server + web).

## Acceptance Criteria
- [ ] Root `package.json` with workspace scripts (`pnpm dev`, `pnpm build`, `pnpm start`)
- [ ] `pnpm-workspace.yaml` declaring `packages/*`
- [ ] `packages/server/package.json` with TypeScript, Fastify deps
- [ ] `packages/web/package.json` with React, Vite, Tailwind deps
- [ ] Root `tsconfig.json` with base config, per-package extends
- [ ] `.gitignore` covering node_modules, dist, .env
- [ ] `pnpm install` runs clean, `pnpm build` compiles both packages
- [ ] README with setup instructions

## Notes
- Use TypeScript strict mode
- Target Node 20+
- ESM modules throughout
