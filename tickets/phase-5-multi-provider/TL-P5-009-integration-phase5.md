# TL-P5-009: Integration — Phase 5 Multi-Provider

**Phase:** 5 - Multi-Provider
**Assignee:** TL (Tech Lead)
**Priority:** High
**Dependencies:** BE-P5-001 through FE-P5-004

## Description
Integrate multi-provider support into the working system. Wire config, settings UI, and provider switching.

## Integration Tasks

### 1. Provider Registry
- [ ] All providers (Anthropic, DeepSeek, OpenAI-compat) registered and selectable
- [ ] Config system (BE-P5-003) loads correct provider on startup
- [ ] Provider switch changes active provider for next AI call

### 2. Settings UI Wiring
- [ ] Settings page (FE-P5-004) reads config from `GET /api/config`
- [ ] Save settings → `POST /api/config` → persisted → active immediately
- [ ] Test connection button calls real provider API
- [ ] StatusBar shows current provider/model, clickable to switch

### 3. Tool Use Compatibility
- [ ] Anthropic tool use format mapping works with all existing tools
- [ ] OpenAI-compat tool use works with DeepSeek, Kimi, etc.
- [ ] Providers without tool support degrade gracefully

### 4. First Run
- [ ] No config → settings page shown automatically
- [ ] After configuring → redirects to chat, everything works

## Acceptance Criteria
- [ ] Switch between DeepSeek and Anthropic mid-session
- [ ] Settings persist across restart
- [ ] All features (chat, tools, plan, execute) work with each provider
- [ ] First-run setup flow works
