# P5-001: Anthropic (Claude) Provider

**Phase:** 5 - Multi-Provider
**Assignee:** BE (Backend Dev)
**Priority:** High
**Dependencies:** P1-007

## Description
Add Anthropic Claude as a second AI provider with full streaming and tool-use support.

## Acceptance Criteria
- [ ] `src/providers/anthropic.ts` — implements `AIProvider` interface
- [ ] Uses Anthropic Messages API with streaming (`stream: true`)
- [ ] Supports tool use (Anthropic native tool_use format)
- [ ] Map between internal `Tool` format and Anthropic's tool schema
- [ ] API key from config or `ANTHROPIC_API_KEY` env var
- [ ] Model configurable (default: `claude-sonnet-4-20250514`)
- [ ] Handle Anthropic-specific streaming events: `content_block_delta`, `content_block_stop`
- [ ] Error handling: invalid key, rate limit, overloaded errors
- [ ] Map Anthropic stop reasons to internal `StreamEvent` types

## Notes
- Anthropic has a different API format than OpenAI — needs dedicated implementation
- Tool use format differs: Anthropic uses `tool_use` content blocks
