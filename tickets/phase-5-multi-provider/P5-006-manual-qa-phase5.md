# P5-006: Manual QA — Phase 5 Multi-Provider

**Phase:** 5 - Multi-Provider
**Assignee:** MQA (Manual QA)
**Priority:** High
**Dependencies:** P5-003, P5-004

## Description
Manually test multi-provider support, settings UI, and provider switching.

## Test Cases

### TC-5.1: Settings Page
- [ ] Gear icon in StatusBar opens settings
- [ ] Provider list shows configured providers
- [ ] Can enter API key (masked input, show/hide toggle)
- [ ] "Test connection" button → shows success/failure
- [ ] Invalid API key → clear error message
- [ ] Save → settings persisted (verify after restart)
- [ ] Close settings → return to chat

### TC-5.2: Anthropic Provider
- [ ] Configure Anthropic API key → test connection succeeds
- [ ] Switch to Anthropic → chat works with Claude
- [ ] Tool use works (AI reads files, searches)
- [ ] Plan generation works
- [ ] Plan execution works

### TC-5.3: DeepSeek Provider
- [ ] Same tests as TC-5.2 but with DeepSeek

### TC-5.4: Custom Provider (Ollama)
- [ ] Add custom endpoint (localhost:11434) → test connection
- [ ] Chat works with local model
- [ ] Handle gracefully if tool use not supported

### TC-5.5: Provider Switching
- [ ] Switch provider mid-session → next message uses new provider
- [ ] StatusBar shows current provider/model
- [ ] Quick switch from StatusBar works
- [ ] Conversation history maintained after switch

### TC-5.6: Config Priority
- [ ] Set key via env var `DEEPSEEK_API_KEY` → used if no config
- [ ] Config file overrides env var
- [ ] CLI flag `--provider anthropic` overrides config
- [ ] Project `.brian-code.json` overrides global config

### TC-5.7: First Run
- [ ] Delete config → start app → settings page shown automatically
- [ ] Must configure at least one provider to proceed
- [ ] After saving → redirects to chat
