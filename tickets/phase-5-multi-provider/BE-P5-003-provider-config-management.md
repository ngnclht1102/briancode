# BE-P5-003: Provider Configuration & Management

**Phase:** 5 - Multi-Provider
**Assignee:** BE (Backend Dev)
**Priority:** High
**Dependencies:** BE-P5-001, BE-P5-002

## Description
Implement the config system for managing multiple providers, API keys, and model selection.

## Acceptance Criteria
- [ ] `src/config.ts` — full config management:
  - Load from `~/.brian-code/config.json`
  - Create default config on first run
  - Project-level overrides from `.brian-code.json` in project root
- [ ] Config schema:
  ```json
  {
    "defaultProvider": "deepseek",
    "providers": {
      "deepseek": { "apiKey": "sk-...", "model": "deepseek-chat" },
      "anthropic": { "apiKey": "sk-ant-...", "model": "claude-sonnet-4-20250514" },
      "custom": { "baseUrl": "...", "apiKey": "...", "model": "..." }
    }
  }
  ```
- [ ] API keys stored securely (file permissions 600)
- [ ] CLI flags override config: `--provider deepseek --model deepseek-chat`
- [ ] Environment variables override: `DEEPSEEK_API_KEY`, `ANTHROPIC_API_KEY`
- [ ] Priority: CLI flag > env var > project config > global config
- [ ] REST endpoint: `GET /api/config` (returns config without API keys)
- [ ] REST endpoint: `POST /api/config` (update config)

## Notes
- Never expose API keys to the frontend — only provider names and models
- On first run, prompt user to set up API key (via UI in FE-P5-004)

## Mock Strategy (for parallel development)
- **Do NOT wait for BE-P5-001 or BE-P5-002**
- Mock providers: register fake providers that return mock streams
- Focus on: config file read/write, env var loading, CLI flag parsing, priority chain
- Real providers registered during TL-P5-009 (integration)
