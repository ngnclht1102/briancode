# BE-P5-002: Generic OpenAI-Compatible Provider

**Phase:** 5 - Multi-Provider
**Assignee:** BE (Backend Dev)
**Priority:** High
**Dependencies:** BE-P1-007

## Description
Generalize the DeepSeek provider into a configurable OpenAI-compatible provider that works with any API following the OpenAI format (Kimi, Groq, Together, local Ollama, etc.).

## Acceptance Criteria
- [ ] `src/providers/openai-compat.ts` — generic OpenAI-compatible provider
- [ ] Configurable: `baseUrl`, `apiKey`, `model`, `name`
- [ ] Refactor DeepSeek provider to use this as base (DeepSeek = OpenAI-compat with preset URL)
- [ ] Supports streaming via SSE (`text/event-stream`)
- [ ] Supports tool use (OpenAI function calling format)
- [ ] Pre-configured presets:
  - DeepSeek: `https://api.deepseek.com`
  - Kimi: `https://api.moonshot.cn/v1`
  - Groq: `https://api.groq.com/openai/v1`
  - Ollama: `http://localhost:11434/v1`
- [ ] Custom endpoint support: user provides base URL + key
- [ ] Handles provider-specific quirks (some don't support all tool features)

## Notes
- Most providers now follow OpenAI's format, so this covers many at once
- Ollama runs locally — no API key needed

## Mock Strategy (for parallel development)
- Develop as standalone module implementing `AIProvider` interface
- Test with DeepSeek and/or local Ollama endpoint
- No server dependency — test with own script
- Registered into provider system during TL-P5-009 (integration)
