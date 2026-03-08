# TL-P6-006: Global Install & Distribution

**Phase:** 6 - Polish
**Assignee:** TL (Tech Lead)
**Priority:** High
**Dependencies:** All previous phases

## Description
Package the app for distribution via npm global install. Build pipeline that bundles frontend into server.

## Acceptance Criteria
- [ ] Build script: compiles TypeScript backend + bundles React frontend
- [ ] Server serves bundled frontend from `dist/web/` in production mode
- [ ] `package.json` `bin` field: `{ "brian-code": "./bin/brian.js" }`
- [ ] `npm install -g brian-code` (or `yarn add -g brian-code`) works
- [ ] After install: `brian-code` command available globally
- [ ] Verify on clean machine: install, run, open browser, chat works
- [ ] `.npmignore` or `files` field to exclude source, include only dist
- [ ] Version management and CHANGELOG
- [ ] README with: install instructions, usage, configuration, screenshots

## Notes
- Frontend is pre-built and included in npm package (no Vite needed at runtime)
- Target: single `npm install -g` command to get everything running
