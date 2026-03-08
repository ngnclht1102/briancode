# Brian Code — Team Workflow

## Overview

Every phase follows the same 3-step execution pattern:

```
Step 1: Parallel Dev (all teams)  →  Step 2: Integration (TL)  →  Step 3: QA (MQA + AQA)
```

No one waits for anyone in Step 1. Dependencies are mocked. The Tech Lead wires everything together in Step 2. QA validates the integrated system in Step 3.

---

## Roles & Responsibilities

### Tech Lead (TL)
- Owns architecture decisions and system design
- Scaffolds project infrastructure
- Performs all integration work (Step 2) — replaces mocks with real wiring
- Reviews all code before a phase is considered complete
- Final release sign-off

### Backend Dev (BE)
- Builds all server-side modules: server, providers, context, executor
- Each module developed as standalone with its own test script
- Exports clean interfaces that integration can wire together
- Provides mock implementations for FE to use during Step 1

### Frontend Dev (FE)
- Builds all UI components: chat, plan view, diff viewer, settings, etc.
- Uses mock data and fake WebSocket events during Step 1
- Provides mock event dispatchers for AQA test setup

### Business Analyst (BA)
- Writes detailed requirements and acceptance criteria before/during Step 1
- Documents WebSocket protocol contracts (shared between FE and BE)
- Validates completed features against acceptance criteria in Step 3
- Reports bugs with reproduction steps

### Manual QA (MQA)
- Prepares test cases during Step 1 (while dev is building)
- Executes manual tests in Step 3 after integration
- Tests on multiple browsers (Chrome, Firefox, Safari)
- Files detailed bug reports with screenshots and steps to reproduce
- Performs full regression in Phase 6

### Automation QA (AQA)
- Sets up Playwright test infrastructure in Phase 1 Step 1
- Writes E2E test specs during Step 1 (using mock providers for deterministic behavior)
- Runs full test suite in Step 3 after integration
- Maintains CI pipeline for automated test runs
- Cross-browser testing (Chromium, Firefox, WebKit)

---

## Step 1: Parallel Development

### Rules
1. **Never wait for dependencies.** Mock them. Every ticket has a "Mock Strategy" section.
2. **Build standalone modules.** Each module should work and be testable independently.
3. **Export clean interfaces.** Your module will be wired by the Tech Lead in Step 2.
4. **Write a mock implementation.** Other team members may need to mock your module — provide a simple fake they can import or copy.

### Developer Workflow (BE & FE)

```
1. Pick up your ticket from Step 1
2. Read the ticket, especially the "Mock Strategy" section
3. Create a feature branch: git checkout -b <ticket-id>/<short-name>
   Example: git checkout -b BE-P1-002/fastify-server
4. Set up your module as standalone (own test script or Storybook)
5. Implement the feature
6. Write unit tests for your module
7. Test with mocks to verify it works in isolation
8. Push branch and open a PR
9. Mark ticket as "Ready for Integration"
```

### BA Workflow

```
1. Pick up your requirements ticket for the current phase
2. Write detailed user stories and acceptance criteria
3. Document shared contracts:
   - WebSocket message formats (JSON schemas)
   - REST API endpoints (request/response shapes)
   - TypeScript interfaces for shared types
4. Share contract documents with FE and BE so they mock consistently
5. Review completed PRs for spec compliance
6. Prepare test scenarios for MQA
```

### AQA Workflow (Step 1)

```
1. Write test specs based on BA's acceptance criteria
2. Create mock providers that return deterministic responses
3. Set up test fixtures (fake project directories, mock WebSocket events)
4. Tests can be written before integration — they'll run against mocks first
5. Tests should be structured to work with both mocks and real system
```

### MQA Workflow (Step 1)

```
1. Review BA's requirements and acceptance criteria
2. Write detailed manual test cases (see ticket for template)
3. Identify edge cases and negative test scenarios
4. Prepare test environments:
   - Small project (<50 files)
   - Medium project (200-500 files)
   - Large project (1000+ files)
   - Empty project
5. Test cases ready to execute as soon as Step 2 completes
```

---

## Step 2: Integration

### Who: Tech Lead only
### When: All Step 1 tickets are "Ready for Integration"

### Integration Workflow

```
1. Review all PRs from Step 1
2. Merge all feature branches into a phase integration branch:
   git checkout -b integrate/phase-<N>
3. Follow the integration ticket (TL-P*-INT) step by step:
   a. Wire modules together (replace mocks with real imports)
   b. Fix contract mismatches between FE and BE
   c. Verify data flows end-to-end
   d. Remove all mock implementations from production code
4. Run existing unit tests — all must pass
5. Smoke test: manually verify the happy path works
6. Perform code review (TL-P*-013/etc):
   - Architecture consistency
   - Security audit (especially for file ops, shell ops, path traversal)
   - Performance check
   - Code quality (types, naming, dead code)
7. Document any issues found, request fixes from dev if needed
8. Merge integration branch to main
9. Tag: git tag phase-<N>-complete
10. Notify QA: "Phase N ready for testing"
```

### Integration Checklist (every phase)
- [ ] All mocks replaced with real implementations
- [ ] No `// TODO: replace mock` comments remaining
- [ ] All unit tests passing
- [ ] Happy path works end-to-end
- [ ] TypeScript builds with zero errors
- [ ] No console errors in browser
- [ ] Security review complete (for phases with file/shell ops)

---

## Step 3: Testing & Verification

### Who: MQA + AQA in parallel
### When: Tech Lead says "Phase N ready for testing"

### MQA Workflow

```
1. Pull latest main branch
2. Start the app: yarn dev (or brian-code for later phases)
3. Execute all test cases from your phase ticket
4. For each test case:
   - Pass: check it off
   - Fail: file a bug report (see Bug Report Template below)
5. Test on Chrome, Firefox, Safari
6. Report results to Tech Lead:
   - Total test cases: X
   - Passed: Y
   - Failed: Z
   - Blocked: W (with reasons)
7. Retest fixed bugs after dev addresses them
```

### AQA Workflow

```
1. Pull latest main branch
2. Run full E2E suite: yarn test:e2e
3. Fix any tests that fail due to integration changes
4. Add new tests for any integration-specific behaviors discovered
5. Run cross-browser: yarn test:e2e --project=chromium,firefox,webkit
6. Generate test report
7. Report results:
   - Total specs: X
   - Passed: Y
   - Failed: Z
   - Flaky: W
8. Fix flaky tests before marking phase complete
```

### Exit Criteria (phase complete)
- [ ] All MQA test cases pass (or failures tracked as known issues)
- [ ] All AQA E2E tests pass on all browsers
- [ ] No critical or high-severity bugs open
- [ ] Tech Lead code review approved
- [ ] BA acceptance criteria validated

---

## Bug Report Template

```markdown
## Bug: [Short description]

**Ticket:** [related ticket ID]
**Severity:** Critical / High / Medium / Low
**Found by:** MQA / AQA
**Browser:** Chrome 120 / Firefox 121 / Safari 17
**Phase:** [N]

### Steps to Reproduce
1. Start the app with `yarn dev`
2. Navigate to...
3. Click...
4. Type...

### Expected Result
[What should happen]

### Actual Result
[What actually happens]

### Screenshot / Recording
[Attach screenshot or screen recording]

### Console Errors
[Paste any browser console or server console errors]

### Environment
- OS: macOS 14.2 / Windows 11 / Ubuntu 22.04
- Node.js: 20.x
- Browser: [name and version]
```

---

## Git Workflow

### Branching Strategy

```
main
├── integrate/phase-1        ← TL creates for integration
│   ├── BE-P1-002/fastify-server     ← dev feature branches
│   ├── FE-P1-004/frontend-setup
│   ├── BE-P1-007/deepseek-provider
│   └── ...
├── integrate/phase-2
│   ├── BE-P2-001/file-tree
│   └── ...
└── ...
```

### Branch Naming
```
<team>-<ticket-id>/<short-description>
Examples:
  BE-P1-002/fastify-server
  FE-P1-005/chat-ui
  AQA-P1-011/test-infra
```

### PR Rules
1. One PR per ticket
2. PR title: `[<ticket-id>] Short description`
   Example: `[BE-P1-002] Fastify server with WebSocket support`
3. PR description must include:
   - What was built
   - How to test it (standalone, with mocks)
   - What was mocked and what's real
   - Checklist of acceptance criteria from ticket
4. At least 1 review required (from TL or peer)
5. All CI checks must pass before merge

### Commit Messages
```
<type>(<scope>): <description>

Types: feat, fix, refactor, test, docs, chore
Scope: server, web, provider, context, executor, e2e, config

Examples:
  feat(server): add Fastify WebSocket handler
  feat(web): add Chat UI component with mock data
  test(e2e): add Playwright test infrastructure
  fix(provider): handle DeepSeek rate limit errors
  chore(config): add yarn workspace setup
```

---

## Communication

### Daily Sync (15 min)
Each team member answers:
1. What I finished yesterday
2. What I'm working on today
3. Any blockers

### Phase Kickoff
At the start of each phase:
1. BA presents requirements and acceptance criteria
2. TL presents shared contracts (WebSocket protocol, API shapes, interfaces)
3. Team reviews tickets, clarifies mocks needed
4. Everyone picks up Step 1 tickets and starts

### Phase Handoffs
- **Step 1 → Step 2:** Dev marks tickets as "Ready for Integration", notifies TL
- **Step 2 → Step 3:** TL merges integration branch, tags release, notifies QA
- **Step 3 → Next Phase:** QA reports results, TL decides go/no-go

---

## Shared Contracts

Before Step 1 begins, BA and TL define shared contracts so FE and BE mock consistently.

### WebSocket Messages
Defined in PLAN.md. Both FE and BE must implement the same message format:
```typescript
// Shared types (packages/shared/types.ts — or documented in BA's spec)
type ClientMessage =
  | { type: "chat"; message: string }
  | { type: "plan:approve"; stepIds: number[] }
  | { type: "plan:edit"; stepId: number; details: string }
  | { type: "plan:execute" }
  | { type: "cancel" }

type ServerMessage =
  | { type: "chat:stream"; delta: string }
  | { type: "chat:done" }
  | { type: "chat:tool_call"; tool: string; args: Record<string, unknown> }
  | { type: "chat:tool_result"; tool: string; result: string }
  | { type: "plan:steps"; steps: PlanStep[] }
  | { type: "execute:progress"; stepId: number; status: string }
  | { type: "execute:diff"; stepId: number; diff: string }
  | { type: "execute:done"; stepId: number; status: string }
  | { type: "execute:error"; stepId: number; error: string }
  | { type: "error"; message: string }
```

### REST API
```
GET  /api/health          → { status: "ok" }
GET  /api/files           → FileNode[]
GET  /api/agents-md       → { content: string }
GET  /api/config          → Config (without API keys)
POST /api/config          → update config
GET  /api/history          → Conversation[]
GET  /api/history/:id      → Conversation
POST /api/rollback/:id     → { success: boolean }
POST /api/undo             → { success: boolean }
```

### Provider Interface
```typescript
interface AIProvider {
  name: string
  chat(messages: ChatMessage[], tools?: Tool[]): AsyncIterable<StreamEvent>
}
```

These contracts are the source of truth. FE mocks the server side. BE mocks the client side. When TL integrates, they should just work.

---

## Definition of Done

### Per Ticket
- [ ] Code complete and working (with mocks if Step 1)
- [ ] Unit tests written and passing
- [ ] PR opened with description and checklist
- [ ] Mock strategy documented (if applicable)
- [ ] Acceptance criteria met

### Per Phase
- [ ] All Step 1 tickets merged
- [ ] Integration complete (all mocks replaced)
- [ ] Code review approved
- [ ] MQA test cases pass
- [ ] AQA E2E tests pass
- [ ] No critical bugs open
- [ ] Tagged in git: `phase-<N>-complete`

### For Release (v0.1.0)
- [ ] All 6 phases complete
- [ ] Full regression (MQA + AQA) pass
- [ ] Cross-browser verified
- [ ] Global install tested on clean machine
- [ ] Documentation complete
- [ ] TL final sign-off (TL-P6-010)
