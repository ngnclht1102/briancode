# AQA-P5-007: E2E Tests — Phase 5 Multi-Provider

**Phase:** 5 - Multi-Provider
**Assignee:** AQA (Automation QA)
**Priority:** High
**Dependencies:** BE-P5-003, FE-P5-004, AQA-P1-011

## Description
Write Playwright E2E tests for settings page, provider configuration, and provider switching.

## Test Specs

### `tests/settings-page.spec.ts`
```
- should open settings via gear icon
- should list available providers
- should show API key input (masked)
- should toggle API key visibility
- should save settings and persist
- should close settings and return to chat
```

### `tests/settings-provider-config.spec.ts`
```
- should configure DeepSeek provider with API key
- should configure Anthropic provider with API key
- should add custom provider with base URL
- should test connection (mock success)
- should show error on test connection failure
- should set default provider
```

### `tests/provider-switching.spec.ts`
```
- should switch provider from StatusBar
- should show current provider/model in StatusBar
- should maintain conversation after provider switch
- should use new provider for next message after switch
```

### `tests/first-run.spec.ts`
```
- should show settings page when no config exists
- should require at least one provider configured
- should redirect to chat after saving first provider
```

## Acceptance Criteria
- [ ] All test specs above implemented and passing
- [ ] Settings persistence tested: save → restart → verify loaded
- [ ] Mock provider APIs for connection tests
- [ ] Tests run in <60s total

## Notes
- Use Playwright's `storageState` for testing persistence
- First-run test: delete config file before test
