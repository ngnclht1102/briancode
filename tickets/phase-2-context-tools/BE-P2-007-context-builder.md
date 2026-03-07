# BE-P2-007: Baseline Context Builder & Token Budget

**Phase:** 2 - Context & Tools
**Assignee:** BE (Backend Dev)
**Priority:** High
**Dependencies:** BE-P2-001, BE-P2-002

## Description
Build the context assembler that creates the system prompt with baseline context (Agents.md, file tree, config files, git status) and manages the token budget.

## Acceptance Criteria
- [ ] `src/context/context-builder.ts` — assembles full system prompt
- [ ] Includes in order:
  1. Base system prompt ("You are Brian Code...")
  2. Agents.md contents (if exists)
  3. Project file tree (paths only)
  4. Key config file contents (package.json, tsconfig.json)
  5. Git status summary
  6. Tool definitions
- [ ] Token counting using `tiktoken` or simple word-based estimate (1 token ~= 4 chars)
- [ ] If baseline context exceeds budget: truncate file tree first, then skip config files
- [ ] Conversation history trimming: drop oldest messages when approaching limit
- [ ] Configurable total budget (default: 100K tokens, adjustable per model)
- [ ] Expose `getSystemPrompt()` and `trimHistory(messages, budget)` functions

## Notes
- Exact token counting is expensive; a rough estimate is fine for now
- Config files are usually small (<1K tokens each), so include them generously

## Mock Strategy (for parallel development)
- **Do NOT wait for BE-P2-001 or BE-P2-002**
- Mock workspace scanner: hardcoded file tree string
- Mock Agents.md: hardcoded instruction string
- Focus on the assembly logic: system prompt + context + token budgeting
- Real data sources wired during TL-P2-013 (integration)
