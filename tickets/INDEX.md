# Brian Code — Ticket Index

## Team
| Role | ID | Responsibilities |
|------|----|-----------------|
| Tech Lead | TL | Architecture, scaffolding, integration, code review, release |
| Backend Dev | BE | Server, providers, context, executor |
| Frontend Dev | FE | Web UI, components, WebSocket hook, styling |
| Business Analyst | BA | Requirements, acceptance criteria, documentation |
| Manual QA | MQA | Manual testing per phase, bug reporting, regression |
| Automation QA | AQA | Playwright E2E tests, test infrastructure, CI pipeline |

---

## Phase 1 — Foundation (14 tickets)

### Step 1: Parallel Development (with mocks)
All teams work simultaneously. Each ticket mocks its dependencies.

| ID | Title | Assignee | Mocks |
|----|-------|----------|-------|
| TL-P1-001 | Project Scaffolding & yarn Workspace | TL | — (no deps) |
| BE-P1-002 | Fastify Server with WebSocket | BE | Standalone project, mock WS client |
| BE-P1-003 | CLI Entry Point & Browser Auto-Open | BE | Mock server with minimal HTTP placeholder |
| BE-P1-007 | DeepSeek AI Provider Integration | BE | Standalone module, test with own script |
| FE-P1-004 | React + Vite Frontend Setup | FE | Standalone Vite project |
| FE-P1-005 | Chat UI Component | FE | Hardcoded messages, simulated streaming via setInterval |
| FE-P1-006 | WebSocket Connection Hook | FE | Mock WS server using `ws` package |
| BA-P1-009 | Phase 1 Requirements & Testing | BA | — |
| AQA-P1-011 | E2E Test Infrastructure Setup (Playwright) | AQA | — |

```
TL:  ████ TL-P1-001
BE:  ████ BE-P1-002   ████ BE-P1-003   ████ BE-P1-007
FE:  ████ FE-P1-004   ████ FE-P1-005   ████ FE-P1-006
BA:  ████ BA-P1-009
AQA: ████ AQA-P1-011
     ──────────── all in parallel ────────────
```

### Step 2: Integration & Review
Replace all mocks with real implementations. Wire everything together.

| ID | Title | Assignee | Integrates |
|----|-------|----------|------------|
| TL-P1-014 | Integration — Phase 1 | TL | Merges all into workspace, wires WS + provider + chat |
| TL-P1-008 | End-to-End Chat Flow Verification | TL | Verifies full flow works after integration |
| TL-P1-013 | Tech Lead Code Review — Phase 1 | TL | Reviews all Phase 1 code |

```
TL:  ████ TL-P1-014 (integrate) ──> ████ TL-P1-008 (verify) ──> ████ TL-P1-013 (review)
```

### Step 3: Testing & Verification
Both QA teams test the integrated system.

| ID | Title | Assignee |
|----|-------|----------|
| MQA-P1-010 | Manual QA — Phase 1 | MQA |
| AQA-P1-012 | E2E Tests — Phase 1 | AQA |

```
MQA: ████ MQA-P1-010 (manual testing)
AQA: ████ AQA-P1-012 (automated tests)
     ──────── in parallel ────────
```

---

## Phase 2 — Context & Tools (13 tickets)

### Step 1: Parallel Development (with mocks)

| ID | Title | Assignee | Mocks |
|----|-------|----------|-------|
| BE-P2-001 | Workspace File Tree Scanning | BE | Test against fixture directory |
| BE-P2-002 | Agents.md Loader & Watcher | BE | Test with fixture Agents.md |
| BE-P2-003 | AI Tool — read_file | BE | Test against fixture files |
| BE-P2-004 | AI Tool — search_files | BE | Use fast-glob directly on fixture project |
| BE-P2-005 | AI Tools — list_directory & read_git_diff | BE | Test against fixture dir + real git repo |
| BE-P2-006 | Tool Handler & AI Tool-Use Loop | BE | Mock tools with canned responses, mock AI provider |
| BE-P2-007 | Baseline Context Builder | BE | Mock file tree + Agents.md with hardcoded strings |
| FE-P2-008 | Tool Calls Display in UI | FE | Fake `chat:tool_call`/`chat:tool_result` WS events |
| BA-P2-009 | Phase 2 Requirements & Testing | BA | — |

```
BE:  ████ BE-P2-001  ████ BE-P2-002  ████ BE-P2-003  ████ BE-P2-004  ████ BE-P2-005
     ████ BE-P2-006  ████ BE-P2-007
FE:  ████ FE-P2-008
BA:  ████ BA-P2-009
     ──────────── all in parallel ────────────
```

### Step 2: Integration & Review

| ID | Title | Assignee | Integrates |
|----|-------|----------|------------|
| TL-P2-013 | Integration — Phase 2 | TL | Wires tools into agentic loop, context builder, WS handler, UI |
| TL-P2-012 | Tech Lead Code Review — Phase 2 | TL | Security audit + performance review |

```
TL:  ████ TL-P2-013 (integrate) ──> ████ TL-P2-012 (review)
```

### Step 3: Testing & Verification

| ID | Title | Assignee |
|----|-------|----------|
| MQA-P2-010 | Manual QA — Phase 2 | MQA |
| AQA-P2-011 | E2E Tests — Phase 2 | AQA |

```
MQA: ████ MQA-P2-010
AQA: ████ AQA-P2-011
     ──── in parallel ────
```

---

## Phase 3 — Plan Mode (8 tickets)

### Step 1: Parallel Development (with mocks)

| ID | Title | Assignee | Mocks |
|----|-------|----------|-------|
| TL-P3-001 | Plan Mode System Prompt & JSON Schema | TL | Test by calling AI provider directly |
| FE-P3-002 | Plan View UI Component | FE | Hardcoded plan object with 5 sample steps |
| BE-P3-003 | Plan Mode WebSocket Integration | BE | Mock plan parser returns hardcoded plan |
| BA-P3-004 | Phase 3 Requirements & Testing | BA | — |

```
TL:  ████ TL-P3-001
BE:  ████ BE-P3-003
FE:  ████ FE-P3-002
BA:  ████ BA-P3-004
     ──── all in parallel ────
```

### Step 2: Integration & Review

| ID | Title | Assignee | Integrates |
|----|-------|----------|------------|
| TL-P3-008 | Integration — Phase 3 | TL | Wires plan prompt + parser + WS events + PlanView |
| TL-P3-007 | Tech Lead Code Review — Phase 3 | TL | Prompt quality + parsing robustness |

```
TL:  ████ TL-P3-008 (integrate) ──> ████ TL-P3-007 (review)
```

### Step 3: Testing & Verification

| ID | Title | Assignee |
|----|-------|----------|
| MQA-P3-005 | Manual QA — Phase 3 | MQA |
| AQA-P3-006 | E2E Tests — Phase 3 | AQA |

```
MQA: ████ MQA-P3-005
AQA: ████ AQA-P3-006
     ──── in parallel ────
```

---

## Phase 4 — Execution (10 tickets)

### Step 1: Parallel Development (with mocks)

| ID | Title | Assignee | Mocks |
|----|-------|----------|-------|
| BE-P4-001 | File Operations Executor | BE | Test against temp directory, no plan dependency |
| BE-P4-002 | Shell Command Executor | BE | Test with safe commands, no plan dependency |
| BE-P4-004 | Executor Orchestrator & Progress | BE | Mock file-ops/shell-ops with no-ops, fake diffs |
| FE-P4-003 | Diff Generation & Display | FE | Hardcoded unified diff strings |
| FE-P4-005 | Execution Progress UI | FE | Fake execute:progress/done/error WS events |
| BA-P4-006 | Phase 4 Requirements & Testing | BA | — |

```
BE:  ████ BE-P4-001   ████ BE-P4-002   ████ BE-P4-004
FE:  ████ FE-P4-003   ████ FE-P4-005
BA:  ████ BA-P4-006
     ──────────── all in parallel ────────────
```

### Step 2: Integration & Review

| ID | Title | Assignee | Integrates |
|----|-------|----------|------------|
| TL-P4-010 | Integration — Phase 4 | TL | Wires file-ops + shell-ops + diffs + progress into plan→execute pipeline |
| TL-P4-009 | Tech Lead Code Review — Phase 4 | TL | Security audit (filesystem + shell) |

```
TL:  ████ TL-P4-010 (integrate) ──> ████ TL-P4-009 (review)
```

### Step 3: Testing & Verification

| ID | Title | Assignee |
|----|-------|----------|
| MQA-P4-007 | Manual QA — Phase 4 | MQA |
| AQA-P4-008 | E2E Tests — Phase 4 | AQA |

```
MQA: ████ MQA-P4-007
AQA: ████ AQA-P4-008
     ──── in parallel ────
```

---

## Phase 5 — Multi-Provider (9 tickets)

### Step 1: Parallel Development (with mocks)

| ID | Title | Assignee | Mocks |
|----|-------|----------|-------|
| BE-P5-001 | Anthropic (Claude) Provider | BE | Standalone module, test with own script |
| BE-P5-002 | Generic OpenAI-Compatible Provider | BE | Standalone module, test with own script |
| BE-P5-003 | Provider Configuration & Management | BE | Mock providers with fake streams |
| FE-P5-004 | Settings Page UI | FE | Mock REST API responses |
| BA-P5-005 | Phase 5 Requirements & Testing | BA | — |

```
BE:  ████ BE-P5-001   ████ BE-P5-002   ████ BE-P5-003
FE:  ████ FE-P5-004
BA:  ████ BA-P5-005
     ──────────── all in parallel ────────────
```

### Step 2: Integration & Review

| ID | Title | Assignee | Integrates |
|----|-------|----------|------------|
| TL-P5-009 | Integration — Phase 5 | TL | Registers providers, wires config + settings UI + switching |
| TL-P5-008 | Tech Lead Code Review — Phase 5 | TL | API key security + provider compatibility |

```
TL:  ████ TL-P5-009 (integrate) ──> ████ TL-P5-008 (review)
```

### Step 3: Testing & Verification

| ID | Title | Assignee |
|----|-------|----------|
| MQA-P5-006 | Manual QA — Phase 5 | MQA |
| AQA-P5-007 | E2E Tests — Phase 5 | AQA |

```
MQA: ████ MQA-P5-006
AQA: ████ AQA-P5-007
     ──── in parallel ────
```

---

## Phase 6 — Polish (11 tickets)

### Step 1: Parallel Development (with mocks)

| ID | Title | Assignee | Mocks |
|----|-------|----------|-------|
| FE-P6-001 | File Tree Sidebar | FE | Mock `GET /api/files` with hardcoded JSON |
| FE-P6-002 | Syntax Highlighting with Shiki | FE | No deps — pure frontend, hardcoded code samples |
| FE-P6-005 | Dark/Light Theme & Keyboard Shortcuts | FE | No deps — pure frontend |
| BE-P6-003 | Rollback & Undo Support | BE | Standalone module, simulate file ops |
| BE-P6-004 | Conversation History Persistence | BE | Standalone module, mock conversation data |
| BA-P6-007 | Phase 6 Requirements & Final Testing | BA | — |

```
FE:  ████ FE-P6-001   ████ FE-P6-002   ████ FE-P6-005
BE:  ████ BE-P6-003   ████ BE-P6-004
BA:  ████ BA-P6-007
     ──────────── all in parallel ────────────
```

### Step 2: Integration & Review

| ID | Title | Assignee | Integrates |
|----|-------|----------|------------|
| TL-P6-011 | Integration — Phase 6 | TL | Wires all polish features into complete system |
| TL-P6-006 | Global Install & Distribution | TL | Build pipeline, npm packaging |
| TL-P6-010 | Tech Lead Final Code Review & Release Sign-Off | TL | Full codebase review, release gate |

```
TL:  ████ TL-P6-011 (integrate) ──> ████ TL-P6-006 (distribution) ──> ████ TL-P6-010 (final review)
```

### Step 3: Testing & Verification

| ID | Title | Assignee |
|----|-------|----------|
| MQA-P6-008 | Manual QA — Phase 6 & Full Regression | MQA |
| AQA-P6-009 | E2E Tests — Phase 6 & Full Regression Suite | AQA |

```
MQA: ████ MQA-P6-008 (full regression)
AQA: ████ AQA-P6-009 (full regression)
     ──────── in parallel ────────
```

---

## Phase 7 — Project Switching (16 tickets)

### Step 1: Parallel Development (with mocks)

| ID | Title | Assignee | Mocks |
|----|-------|----------|-------|
| BE-P7-001 | POST /api/project/switch Endpoint | BE | Test with temp directories |
| BE-P7-002 | GET /api/project/current Endpoint | BE | Standalone, no mocks |
| BE-P7-003 | Recent Projects Persistence | BE | Direct config file read/write |
| BE-P7-004 | GET /api/project/recent Endpoint | BE | Seeded config data |
| BE-P7-005 | WebSocket Broadcast on Project Switch | BE | Mock WS clients |
| BE-P7-006 | Reset Server State on Project Switch | BE | Call reset functions directly |
| FE-P7-001 | Project Name in StatusBar | FE | Hardcoded project name |
| FE-P7-002 | ProjectSwitcher Modal Component | FE | Mock API responses |
| FE-P7-003 | Recent Projects List in Modal | FE | Hardcoded sample projects |
| FE-P7-004 | Handle project:switched WS Event | FE | Simulated WS events |
| FE-P7-005 | Keyboard Shortcut Cmd/Ctrl+O | FE | No mocks needed |
| BA-P7-001 | Phase 7 Requirements — Project Switching | BA | — |

```
BE:  ████ BE-P7-001  ████ BE-P7-002  ████ BE-P7-003  ████ BE-P7-004  ████ BE-P7-005  ████ BE-P7-006
FE:  ████ FE-P7-001  ████ FE-P7-002  ████ FE-P7-003  ████ FE-P7-004  ████ FE-P7-005
BA:  ████ BA-P7-001
     ──────────── all in parallel ────────────
```

### Step 2: Integration & Review

| ID | Title | Assignee | Integrates |
|----|-------|----------|------------|
| TL-P7-001 | Integration — Phase 7 | TL | Wires all endpoints + modal + WS events + state reset |
| TL-P7-002 | Tech Lead Code Review — Phase 7 | TL | Security audit (path validation, state isolation) |

```
TL:  ████ TL-P7-001 (integrate) ──> ████ TL-P7-002 (review)
```

### Step 3: Testing & Verification

| ID | Title | Assignee |
|----|-------|----------|
| MQA-P7-001 | Manual QA — Phase 7 | MQA |
| AQA-P7-001 | E2E Tests — Phase 7 | AQA |

```
MQA: ████ MQA-P7-001
AQA: ████ AQA-P7-001
     ──── in parallel ────
```

---

## Phase 8 — Conversation Management (16 tickets)

### Step 1: Parallel Development (with mocks)

| ID | Title | Assignee | Mocks |
|----|-------|----------|-------|
| BE-P8-001 | Wire History into Chat Handler | BE | Test by checking history files on disk |
| BE-P8-002 | Load Conversation Endpoint | BE | Create conversation files manually |
| BE-P8-003 | Delete Conversation Endpoint | BE | Create then delete test files |
| BE-P8-004 | Filter History by Project | BE | Seed conversations with different project paths |
| BE-P8-005 | New Conversation Endpoint | BE | Test via curl |
| FE-P8-001 | Conversation List Sidebar Panel | FE | Hardcoded sample conversations |
| FE-P8-002 | Load Conversation from History | FE | Hardcoded loaded messages |
| FE-P8-003 | Delete Conversation UI | FE | Mock DELETE API response |
| FE-P8-004 | New Conversation Button | FE | Mock POST API response |
| FE-P8-005 | Active Conversation Indicator | FE | Hardcoded active ID |
| BA-P8-001 | Phase 8 Requirements — Conversation Management | BA | — |

```
BE:  ████ BE-P8-001  ████ BE-P8-002  ████ BE-P8-003  ████ BE-P8-004  ████ BE-P8-005
FE:  ████ FE-P8-001  ████ FE-P8-002  ████ FE-P8-003  ████ FE-P8-004  ████ FE-P8-005
BA:  ████ BA-P8-001
     ──────────── all in parallel ────────────
```

### Step 2: Integration & Review

| ID | Title | Assignee | Integrates |
|----|-------|----------|------------|
| TL-P8-001 | Integration — Phase 8 | TL | Wires history into chat + all endpoints + sidebar + conversation switching |
| TL-P8-002 | Tech Lead Code Review — Phase 8 | TL | Security audit (ID sanitization, file permissions, path traversal) |

```
TL:  ████ TL-P8-001 (integrate) ──> ████ TL-P8-002 (review)
```

### Step 3: Testing & Verification

| ID | Title | Assignee |
|----|-------|----------|
| MQA-P8-001 | Manual QA — Phase 8 | MQA |
| AQA-P8-001 | E2E Tests — Phase 8 | AQA |

```
MQA: ████ MQA-P8-001
AQA: ████ AQA-P8-001
     ──── in parallel ────
```

---

## Phase 9 — Plan Mode Redesign (10 tickets)

Fundamentally changes plan mode: AI generates a high-level text plan (fast), then execution generates content per file via individual AI API calls (incremental feedback).

### Step 1: Parallel Development (with mocks)

| ID | Title | Assignee | Mocks |
|----|-------|----------|-------|
| BE-P9-001 | Redesign Plan Mode System Prompt | BE | Test with AI provider directly |
| BE-P9-002 | Step-by-Step AI Executor | BE | Mock AI provider returns canned content |
| BE-P9-003 | Update WS Protocol for Execution | BE | Mock WS clients |
| FE-P9-001 | Redesign PlanView for Text Plans | FE | Hardcoded sample text plan |
| FE-P9-002 | Add "Generating" State to Progress | FE | Simulated WS events with generating state |
| FE-P9-003 | Clean Up Plan Store | FE | No mocks needed |
| BA-P9-001 | Phase 9 Requirements — Plan Mode Redesign | BA | — |

```
BE:  ████ BE-P9-001  ████ BE-P9-002  ████ BE-P9-003
FE:  ████ FE-P9-001  ████ FE-P9-002  ████ FE-P9-003
BA:  ████ BA-P9-001
     ──────────── all in parallel ────────────
```

### Step 2: Integration & Review

| ID | Title | Assignee | Integrates |
|----|-------|----------|------------|
| TL-P9-001 | Integration — Phase 9 | TL | Wires new plan prompt + parser + step executor + UI |
| TL-P9-002 | Tech Lead Code Review — Phase 9 | TL | Security, performance, error handling |

```
TL:  ████ TL-P9-001 (integrate) ──> ████ TL-P9-002 (review)
```

### Step 3: Testing & Verification

| ID | Title | Assignee |
|----|-------|----------|
| MQA-P9-001 | Manual QA — Phase 9 | MQA |
| AQA-P9-001 | E2E Tests — Phase 9 | AQA |

```
MQA: ████ MQA-P9-001
AQA: ████ AQA-P9-001
     ──── in parallel ────
```

---

## Execution Pattern (every phase)

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Parallel Dev          Step 2: Integration    Step 3: QA │
│                                                                 │
│ TL ████                       TL ████ INT → ████ REV            │
│ BE ████ ████ ████ (mocked)                           MQA ████   │
│ FE ████ ████ (mocked)                                AQA ████   │
│ BA ████                                                         │
│ AQA ████ (infra, Phase 1 only)                                  │
│                                                                 │
│ ◄── maximum parallelism ──►  ◄── sequential ──►  ◄── parallel─►│
└─────────────────────────────────────────────────────────────────┘
```

**Key principle:** In Step 1, every ticket mocks its dependencies so all team members work simultaneously. Step 2 is where the Tech Lead replaces mocks with real wiring. Step 3 validates the integrated system.

---

## Phase 10 — File Mentions & Attachments (11 tickets)

Users can mention project files with `@`, upload documents (including PDF), and upload images for multimodal AI analysis.

### Step 1: Parallel Development (with mocks)

| ID | Title | Assignee | Mocks |
|----|-------|----------|-------|
| FE-P10-001 | @ File Mention Popup Component | FE | Hardcoded file list |
| FE-P10-002 | Attachment Button & File Upload UI | FE | Client-side file reading, mock PDF upload |
| FE-P10-003 | Update Message Format with Attachments | FE | Depends on FE-P10-001/002 |
| BE-P10-001 | File Upload Endpoint & PDF Extraction | BE | Test with curl, sample PDFs |
| BE-P10-002 | Chat Handler Attachment Processing | BE | Mock attachment payloads |
| BE-P10-003 | Provider Multimodal Support (Images) | BE | Mock multimodal messages |
| BA-P10-001 | Phase 10 Requirements — File Mentions & Attachments | BA | — |

```
FE:  ████ FE-P10-001  ████ FE-P10-002  ──> ████ FE-P10-003
BE:  ████ BE-P10-001  ████ BE-P10-002  ████ BE-P10-003
BA:  ████ BA-P10-001
     ──────────── mostly parallel ────────────
```

### Step 2: Integration & Review

| ID | Title | Assignee | Integrates |
|----|-------|----------|------------|
| TL-P10-001 | Integration — Phase 10 | TL | Wires mentions + uploads + attachments + multimodal providers |
| TL-P10-002 | Tech Lead Code Review — Phase 10 | TL | Security (path traversal, upload validation), performance |

```
TL:  ████ TL-P10-001 (integrate) ──> ████ TL-P10-002 (review)
```

### Step 3: Testing & Verification

| ID | Title | Assignee |
|----|-------|----------|
| MQA-P10-001 | Manual QA — Phase 10 | MQA |
| AQA-P10-001 | E2E Tests — Phase 10 | AQA |

```
MQA: ████ MQA-P10-001
AQA: ████ AQA-P10-001
     ──── in parallel ────
```

---

## Summary

| Phase | Total | Step 1 (Dev) | Step 2 (Integration) | Step 3 (QA) |
|-------|-------|-------------|---------------------|-------------|
| 1 - Foundation | 14 | 9 | 3 | 2 |
| 2 - Context & Tools | 13 | 9 | 2 | 2 |
| 3 - Plan Mode | 8 | 4 | 2 | 2 |
| 4 - Execution | 10 | 6 | 2 | 2 |
| 5 - Multi-Provider | 9 | 5 | 2 | 2 |
| 6 - Polish | 11 | 6 | 3 | 2 |
| 7 - Project Switching | 16 | 12 | 2 | 2 |
| 8 - Conversations | 16 | 11 | 2 | 2 |
| 9 - Plan Redesign | 10 | 7 | 2 | 2 |
| 10 - File Mentions & Attachments | 11 | 7 | 2 | 2 |
| **Total** | **118** | **76** | **22** | **20** |

### Per-Team Workload

| Role | Total | Step 1 | Step 2 | Step 3 |
|------|-------|--------|--------|--------|
| TL | 24 | 2 | 22 | — |
| BE | 36 | 36 | — | — |
| FE | 27 | 27 | — | — |
| BA | 10 | 10 | — | — |
| MQA | 10 | — | — | 10 |
| AQA | 11 | 1 | — | 10 |
