# FE-P5-004: Settings Page UI

**Phase:** 5 - Multi-Provider
**Assignee:** FE (Frontend Dev)
**Priority:** High
**Dependencies:** BE-P5-003

## Description
Build a settings page in the web UI for managing providers, API keys, and model selection.

## Acceptance Criteria
- [ ] Settings page accessible via gear icon in StatusBar
- [ ] Provider section:
  - List of configured providers with status (active/inactive)
  - API key input per provider (masked, with show/hide toggle)
  - Model selection dropdown per provider
  - "Test connection" button — verifies API key works
- [ ] Default provider selector
- [ ] Custom provider form: base URL + API key + model name
- [ ] Save button — sends config to `POST /api/config`
- [ ] First-run experience: if no API key configured, show settings on launch
- [ ] Provider/model shown in StatusBar, clickable to switch quickly
- [ ] Changes take effect immediately (no restart needed)

## Notes
- API keys are sent to backend for storage, never persisted in browser
- Keep the UI simple — most users will only use 1-2 providers

## Mock Strategy (for parallel development)
- **Do NOT wait for BE-P5-003**
- Mock REST API: fake `GET /api/config` and `POST /api/config` responses
- Mock test connection: simulate success/failure
- Build full settings UI against mock API responses
- Real API endpoints wired during TL-P5-009 (integration)
