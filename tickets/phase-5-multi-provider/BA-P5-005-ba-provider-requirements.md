# BA-P5-005: Phase 5 Requirements & Provider Testing

**Phase:** 5 - Multi-Provider
**Assignee:** BA (Business Analyst)
**Priority:** High
**Dependencies:** BA-P4-006

## Description
Test multi-provider support, config management, and the settings UI.

## Acceptance Criteria
- [ ] Test each provider:
  - DeepSeek: basic chat, tool use, plan generation
  - Anthropic: basic chat, tool use, plan generation
  - Custom endpoint (e.g., Ollama local): basic chat
- [ ] Test provider switching mid-session
- [ ] Test config persistence:
  - Set API key → restart → key still configured
  - Project-level config overrides global
  - CLI flags override config
- [ ] Test settings UI:
  - Add/remove providers
  - Test connection button works
  - Invalid API key shows clear error
- [ ] Test first-run experience (no config exists)
- [ ] Compare plan quality across providers (same prompt, different models)
- [ ] Document provider-specific limitations (e.g., tool use support)

## Notes
- Some providers may not support tool use — document fallback behavior
- Test with free-tier keys where possible
