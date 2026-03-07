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

## Phase 1 — Foundation (13 tickets)

| ID | Title | Assignee | Priority | Dependencies |
|----|-------|----------|----------|--------------|
| P1-001 | Project Scaffolding & pnpm Workspace | TL | Critical | — |
| P1-002 | Fastify Server with WebSocket | BE | Critical | P1-001 |
| P1-003 | CLI Entry Point & Browser Auto-Open | BE | High | P1-002 |
| P1-004 | React + Vite Frontend Setup | FE | Critical | P1-001 |
| P1-005 | Chat UI Component | FE | Critical | P1-004 |
| P1-006 | WebSocket Connection Hook | FE | Critical | P1-004, P1-002 |
| P1-007 | DeepSeek AI Provider Integration | BE | Critical | P1-002 |
| P1-008 | End-to-End Chat Flow | TL | Critical | P1-005, P1-006, P1-007 |
| P1-009 | Phase 1 Requirements & Testing | BA | High | — |
| P1-010 | Manual QA — Phase 1 | MQA | High | P1-008 |
| P1-011 | E2E Test Infrastructure Setup (Playwright) | AQA | Critical | P1-001 |
| P1-012 | E2E Tests — Phase 1 | AQA | High | P1-008, P1-011 |
| P1-013 | Tech Lead Code Review — Phase 1 | TL | High | P1-002 to P1-007 |

### Phase 1 Parallel Work
```
TL:  P1-001 ─────────────────────────────> P1-008 ──> P1-013 (review)
BE:           P1-002 ──> P1-003  P1-007 ─>
FE:           P1-004 ──> P1-005  P1-006 ─>
BA:  P1-009 (ongoing) ──────────────────────────────>
MQA:                                        P1-010 ─>
AQA: P1-011 (infra) ──────────────────────> P1-012 ─>
```

---

## Phase 2 — Context & Tools (12 tickets)

| ID | Title | Assignee | Priority | Dependencies |
|----|-------|----------|----------|--------------|
| P2-001 | Workspace File Tree Scanning | BE | Critical | P1-002 |
| P2-002 | Agents.md Loader & Watcher | BE | High | P1-002 |
| P2-003 | AI Tool — read_file | BE | Critical | P1-007 |
| P2-004 | AI Tool — search_files | BE | Critical | P2-001 |
| P2-005 | AI Tools — list_directory & read_git_diff | BE | High | P2-001 |
| P2-006 | Tool Handler & AI Tool-Use Loop | BE | Critical | P2-003, P2-004, P2-005 |
| P2-007 | Baseline Context Builder & Token Budget | BE | High | P2-001, P2-002 |
| P2-008 | Tool Calls Display in UI | FE | High | P1-006, P2-006 |
| P2-009 | Phase 2 Requirements & Testing | BA | High | P1-009 |
| P2-010 | Manual QA — Phase 2 | MQA | High | P2-006, P2-008 |
| P2-011 | E2E Tests — Phase 2 | AQA | High | P2-006, P2-008, P1-011 |
| P2-012 | Tech Lead Code Review — Phase 2 | TL | High | P2-001 to P2-008 |

### Phase 2 Parallel Work
```
TL:                                                    P2-012 (review)
BE:  P2-001 ──> P2-004, P2-005 ──> P2-006 ──> P2-007
     P2-002 ──────────────────────>
     P2-003 ──────────────────────>
FE:                                  P2-008 ──────────>
BA:  P2-009 (ongoing) ──────────────────────────────>
MQA:                                          P2-010 ─>
AQA:                                          P2-011 ─>
```

---

## Phase 3 — Plan Mode (7 tickets)

| ID | Title | Assignee | Priority | Dependencies |
|----|-------|----------|----------|--------------|
| P3-001 | Plan Mode System Prompt & JSON Schema | TL | Critical | P2-007 |
| P3-002 | Plan View UI Component | FE | Critical | P1-005, P3-001 |
| P3-003 | Plan Mode WebSocket Integration | BE | Critical | P3-001, P2-006 |
| P3-004 | Phase 3 Requirements & Testing | BA | High | P2-009 |
| P3-005 | Manual QA — Phase 3 | MQA | High | P3-002, P3-003 |
| P3-006 | E2E Tests — Phase 3 | AQA | High | P3-002, P3-003, P1-011 |
| P3-007 | Tech Lead Code Review — Phase 3 | TL | High | P3-002, P3-003 |

### Phase 3 Parallel Work
```
TL:  P3-001 ─────────────────────────> P3-007 (review)
BE:           P3-003 ────────>
FE:           P3-002 ────────>
BA:  P3-004 (ongoing) ──────>
MQA:                           P3-005 ────>
AQA:                           P3-006 ────>
```

---

## Phase 4 — Execution (9 tickets)

| ID | Title | Assignee | Priority | Dependencies |
|----|-------|----------|----------|--------------|
| P4-001 | File Operations Executor | BE | Critical | P3-003 |
| P4-002 | Shell Command Executor | BE | Critical | P3-003 |
| P4-003 | Diff Generation & Display | FE | High | P4-001 |
| P4-004 | Executor Orchestrator & Progress | BE | Critical | P4-001, P4-002, P4-003 |
| P4-005 | Execution Progress UI | FE | High | P3-002, P4-004 |
| P4-006 | Phase 4 Requirements & Testing | BA | High | P3-004 |
| P4-007 | Manual QA — Phase 4 | MQA | High | P4-004, P4-005 |
| P4-008 | E2E Tests — Phase 4 | AQA | High | P4-004, P4-005, P1-011 |
| P4-009 | Tech Lead Code Review — Phase 4 | TL | Critical | P4-001 to P4-005 |

### Phase 4 Parallel Work
```
TL:                                          P4-009 (review)
BE:  P4-001    P4-002 ──────> P4-004 ────>
FE:        P4-003 ──────────> P4-005 ────>
BA:  P4-006 (ongoing) ──────────────────>
MQA:                                  P4-007 ────>
AQA:                                  P4-008 ────>
```

---

## Phase 5 — Multi-Provider (8 tickets)

| ID | Title | Assignee | Priority | Dependencies |
|----|-------|----------|----------|--------------|
| P5-001 | Anthropic (Claude) Provider | BE | High | P1-007 |
| P5-002 | Generic OpenAI-Compatible Provider | BE | High | P1-007 |
| P5-003 | Provider Configuration & Management | BE | High | P5-001, P5-002 |
| P5-004 | Settings Page UI | FE | High | P5-003 |
| P5-005 | Phase 5 Requirements & Testing | BA | High | P4-006 |
| P5-006 | Manual QA — Phase 5 | MQA | High | P5-003, P5-004 |
| P5-007 | E2E Tests — Phase 5 | AQA | High | P5-003, P5-004, P1-011 |
| P5-008 | Tech Lead Code Review — Phase 5 | TL | High | P5-001 to P5-004 |

### Phase 5 Parallel Work
```
TL:                                    P5-008 (review)
BE:  P5-001    P5-002 ──> P5-003 ────>
FE:                        P5-004 ────>
BA:  P5-005 (ongoing) ──────────────>
MQA:                              P5-006 ────>
AQA:                              P5-007 ────>
```

---

## Phase 6 — Polish (10 tickets)

| ID | Title | Assignee | Priority | Dependencies |
|----|-------|----------|----------|--------------|
| P6-001 | File Tree Sidebar | FE | Medium | P2-001 |
| P6-002 | Syntax Highlighting with Shiki | FE | Medium | P4-003 |
| P6-003 | Rollback & Undo Support | BE | High | P4-004 |
| P6-004 | Conversation History Persistence | BE | Medium | P1-008 |
| P6-005 | Dark/Light Theme & Keyboard Shortcuts | FE | Medium | P1-004 |
| P6-006 | Global Install & Distribution | TL | High | All |
| P6-007 | Phase 6 Requirements & Final Testing | BA | High | P5-005 |
| P6-008 | Manual QA — Phase 6 & Full Regression | MQA | Critical | P6-001 to P6-006 |
| P6-009 | E2E Tests — Phase 6 & Full Regression Suite | AQA | High | P6-001 to P6-006, P1-011 |
| P6-010 | Tech Lead Final Code Review & Release Sign-Off | TL | Critical | P6-001 to P6-009 |

### Phase 6 Parallel Work
```
TL:                                            P6-006 ──> P6-010 (final review)
BE:  P6-003    P6-004 ──────────────────────>
FE:  P6-001    P6-002    P6-005 ────────────>
BA:                                P6-007 ──>
MQA:                                      P6-008 (regression) ────>
AQA:                                      P6-009 (regression) ────>
```

---

## Summary

| Phase | Total | TL | BE | FE | BA | MQA | AQA |
|-------|-------|----|----|----|----|-----|-----|
| 1 - Foundation | 13 | 3 | 3 | 3 | 1 | 1 | 2 |
| 2 - Context & Tools | 12 | 1 | 7 | 1 | 1 | 1 | 1 |
| 3 - Plan Mode | 7 | 2 | 1 | 1 | 1 | 1 | 1 |
| 4 - Execution | 9 | 1 | 3 | 2 | 1 | 1 | 1 |
| 5 - Multi-Provider | 8 | 1 | 3 | 1 | 1 | 1 | 1 |
| 6 - Polish | 10 | 2 | 2 | 3 | 1 | 1 | 1 |
| **Total** | **59** | **10** | **19** | **11** | **6** | **6** | **7** |
