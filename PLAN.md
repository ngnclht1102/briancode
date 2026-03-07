# Brian Code - AI Coding Assistant with Web UI

A local AI coding assistant with a browser-based UI. Node.js backend handles file operations, shell commands, and AI calls. Web frontend provides rich chat and plan/execute interface.

## Architecture

```
+------------------+    WebSocket     +---------------------------+
|  Browser UI      | <=============> |  Node.js Server           |
|  (localhost:3000)|                  |                           |
|                  |                  |  +---------------------+  |
|  - Chat view     |                  |  | AI Provider Layer   |  |
|  - Plan review   |                  |  | DeepSeek/Anthropic  |  |
|  - Diff viewer   |                  |  +---------------------+  |
|  - File explorer  |                  |  | Plan Engine         |  |
|                  |                  |  +---------------------+  |
|                  |                  |  | Executor Engine      |  |
|                  |                  |  | fs / child_process   |  |
|                  |                  |  +---------------------+  |
|                  |                  |  | Context Gathering    |  |
|                  |                  |  +---------------------+  |
+------------------+                  +---------------------------+
```

## Module Breakdown

### 1. CLI Entry (`src/cli.ts`)
- Minimal: parse args, start server, open browser
- Command: `brian-code` or `brian-code --port 3001`
- Auto-opens `http://localhost:3000` in default browser

### 2. Server (`src/server/`)
- `server.ts` - Fastify HTTP server + WebSocket (via `@fastify/websocket`)
- `router.ts` - REST endpoints for config, file browsing
- `ws-handler.ts` - WebSocket message handler for chat, plan, execute
- Serves static frontend files

### 3. Web UI (`web/`)
- Built with React + Vite
- `App.tsx` - main layout
- `components/Chat.tsx` - chat message list with markdown rendering
- `components/Input.tsx` - prompt input (multi-line, Shift+Enter)
- `components/PlanView.tsx` - plan steps with approve/skip/edit
- `components/DiffView.tsx` - side-by-side diff viewer
- `components/FileTree.tsx` - project file tree sidebar
- `components/StatusBar.tsx` - connection status, model info
- Styling with Tailwind CSS

### 4. AI Provider Layer (`src/providers/`)
- `types.ts` - common interface: `chat(messages) -> AsyncIterable<string>`
- `anthropic.ts` - Claude API (streaming)
- `deepseek.ts` - DeepSeek API (OpenAI-compatible)
- `openai-compat.ts` - generic for any OpenAI-compatible endpoint
- Provider selection via config

### 5. Plan Engine (`src/plan/`)
- `planner.ts` - sends user prompt + workspace context to AI, gets structured plan
- Plan format: array of steps, each with:
  - `type`: edit | create | delete | shell | search
  - `description`: human-readable explanation
  - `target`: file path or command
  - `details`: specific changes or arguments
- `types.ts` - plan step type definitions

### 6. Executor Engine (`src/executor/`)
- `executor.ts` - iterates through approved plan steps
- `file-ops.ts` - create/edit/delete files via Node.js `fs`
- `shell-ops.ts` - run shell commands via `child_process`
- `diff.ts` - generate unified diffs
- Reports progress back to UI via WebSocket
- Rollback support: track changes for undo

### 7. Context Gathering (`src/context/`) - Tool-Use Approach

The AI gathers context on-demand by calling tools, rather than us sending everything upfront.
This is how Claude Code and Cursor work — the AI decides what it needs to read.

#### Baseline Context (always included)
Sent automatically with every AI request — cheap, high-value:
- **Agents.md** (project root) — project-level instructions, conventions, architecture notes, coding standards. This is the primary way users configure AI behavior per project. Loaded once at startup, re-read if modified. Similar to CLAUDE.md / Cursor Rules / .github/copilot-instructions.md.
- **Project file tree** (paths only, not contents) via `fast-glob`, respecting `.gitignore`
- **Config files**: `package.json`, `tsconfig.json`, `.env.example`, etc.
- **Git status**: modified/staged/untracked files, current branch
- **Conversation history**: prior messages in the session

#### Agents.md Format
Lives at project root. Users write free-form instructions for the AI:

```markdown
# Agents.md

## Project
This is a Next.js 14 app with App Router, using Prisma + PostgreSQL.

## Conventions
- Use server components by default, "use client" only when needed
- All API routes go in src/app/api/
- Use zod for validation
- Prefer named exports

## Architecture
- src/app/ - pages and layouts
- src/lib/ - shared utilities
- src/components/ - reusable UI components
- src/db/ - Prisma schema and client

## Rules
- Never modify prisma/schema.prisma without asking first
- Always run "npm run lint" after editing
- Use existing UI components from src/components/ui/ before creating new ones
```

The entire contents of Agents.md are injected into the system prompt so the AI follows project-specific rules from the first message.

#### AI Tools (on-demand)
The AI is given tools it can call to gather more context when needed:

```json
{
  "tools": [
    {
      "name": "read_file",
      "description": "Read the contents of a file",
      "params": { "path": "string", "startLine?": "number", "endLine?": "number" }
    },
    {
      "name": "search_files",
      "description": "Search for a pattern across project files (grep)",
      "params": { "query": "string", "glob?": "string" }
    },
    {
      "name": "list_directory",
      "description": "List files and folders in a directory",
      "params": { "path": "string" }
    },
    {
      "name": "read_git_diff",
      "description": "Get git diff for unstaged or staged changes",
      "params": { "staged?": "boolean" }
    }
  ]
}
```

#### How It Works (example flow)

```
User: "Fix the login bug where email validation fails"

AI thinks: I need to find login-related files.
AI calls: search_files({ query: "login", glob: "**/*.ts" })
Server returns: src/pages/Login.tsx:12, src/api/auth.ts:5, src/utils/validate.ts:20

AI thinks: Let me read the validation logic.
AI calls: read_file({ path: "src/utils/validate.ts" })
Server returns: [file contents]

AI thinks: Found the bug. Now let me read the login page too.
AI calls: read_file({ path: "src/pages/Login.tsx" })
Server returns: [file contents]

AI now has enough context → generates plan to fix the bug.
```

#### Backend Implementation

- `workspace.ts` - scans file tree with `fast-glob`, caches result
- `file-reader.ts` - reads files, supports line ranges for large files
- `search.ts` - grep-like search across project files
- `git.ts` - git status, diff, log via `child_process`
- `tool-handler.ts` - routes AI tool calls to the above modules
- `agents-md.ts` - loads and watches Agents.md from project root
- `context-builder.ts` - assembles baseline context (Agents.md + file tree + config + git), enforces token budget

#### Token Budget Management

```
Total budget (e.g. 128K tokens)
├── System prompt + tool definitions     ~2K  (fixed)
├── Agents.md instructions               ~1-3K (user-defined)
├── Baseline context (file tree, config) ~2-5K (scales with project)
├── Conversation history                 ~varies (trimmed FIFO)
├── Tool call results                    ~varies (cached per session)
└── Remaining → available for AI response
```

Rules:
- Large files: read only requested line ranges, or truncate with "... (truncated, use startLine/endLine to read more)"
- Search results: return max 20 matches with surrounding context (3 lines)
- File tree: collapse deep directories beyond depth 3 into summaries
- If total context exceeds budget: trim oldest conversation messages first, then oldest tool results

### 8. Config (`src/config.ts`)
- Config file at `~/.brian-code/config.json`
- API keys per provider
- Default model selection
- Project-level overrides via `.brian-code.json`

## WebSocket Protocol

Messages are JSON with `type` field:

```
Client -> Server:
  { type: "chat", message: "Add a login page" }
  { type: "plan:approve", stepIds: [0, 1, 2, 3] }
  { type: "plan:edit", stepId: 1, details: "..." }
  { type: "plan:execute" }
  { type: "cancel" }

Server -> Client:
  { type: "chat:stream", delta: "..." }
  { type: "chat:done" }
  { type: "chat:tool_call", tool: "read_file", args: { path: "..." } }
  { type: "chat:tool_result", tool: "read_file", result: "..." }
  { type: "plan:steps", steps: [...] }
  { type: "execute:progress", stepId: 0, status: "running" }
  { type: "execute:diff", stepId: 1, diff: "..." }
  { type: "execute:done", stepId: 0, status: "success" }
  { type: "execute:error", stepId: 2, error: "..." }
  { type: "error", message: "..." }
```

## Project Structure

```
brian-code/
├── package.json                # Root: pnpm workspace config
├── pnpm-workspace.yaml         # Declares packages/*
├── packages/
│   ├── server/                 # Backend package
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── bin/
│   │   │   └── brian.js        # CLI entry shim
│   │   └── src/                # Backend (Node.js)
│   ├── cli.ts                  # Arg parsing, start server
│   ├── config.ts               # Config management
│   ├── server/
│   │   ├── server.ts           # Fastify + WebSocket setup
│   │   ├── router.ts           # REST routes
│   │   └── ws-handler.ts       # WebSocket message handler
│   ├── providers/
│   │   ├── types.ts
│   │   ├── anthropic.ts
│   │   ├── deepseek.ts
│   │   └── openai-compat.ts
│   ├── plan/
│   │   ├── planner.ts
│   │   └── types.ts
│   ├── executor/
│   │   ├── executor.ts
│   │   ├── file-ops.ts
│   │   ├── shell-ops.ts
│   │   └── diff.ts
│       └── context/
│           ├── workspace.ts        # File tree scanning
│           ├── file-reader.ts      # Read files with line ranges
│           ├── search.ts           # Grep-like search
│           ├── git.ts              # Git status, diff, log
│           ├── tool-handler.ts     # Routes AI tool calls
│           ├── agents-md.ts        # Load/watch Agents.md
│           └── context-builder.ts  # Baseline context + token budget
│   └── web/                        # Frontend package
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── hooks/
│           │   └── useWebSocket.ts
│           ├── components/
│           │   ├── Chat.tsx
│           │   ├── Input.tsx
│           │   ├── PlanView.tsx
│           │   ├── DiffView.tsx
│           │   ├── FileTree.tsx
│           │   └── StatusBar.tsx
│           ├── stores/
│           │   └── chatStore.ts    # Zustand store
│           └── styles/
│               └── globals.css
└── .gitignore
```

## User Flow

```
$ brian-code
Brian Code v0.1.0 - http://localhost:3000
Opening browser...
```

Browser opens:

1. User sees chat interface with project name and model info
2. Types: "Add a login page with email/password form"
3. AI streams a plan:
   - Step 1: [create] src/pages/Login.tsx - Login form component
   - Step 2: [edit] src/App.tsx - Add login route
   - Step 3: [create] src/api/auth.ts - Login API function
   - Step 4: [shell] npm install axios
4. User reviews plan - can toggle steps on/off, click to edit details
5. Clicks "Execute"
6. Each step executes with live progress:
   - File diffs shown inline with syntax highlighting
   - Shell output streamed live
   - Green checkmark / red X per step
7. Back to chat for next prompt

## Tech Choices

| Concern         | Choice                  | Why                              |
|-----------------|-------------------------|----------------------------------|
| Package manager | pnpm                    | Fast, disk-efficient, workspace support |
| Monorepo        | pnpm workspaces         | Native, no extra tooling needed  |
| Backend         | Node.js + TypeScript    | Native fs access, ecosystem      |
| HTTP server     | Fastify                 | Fast, plugin-based, TS support   |
| Real-time       | WebSocket (@fastify/ws) | Streaming AI + live progress     |
| Frontend        | React + Vite            | Fast dev, rich UI                |
| Styling         | Tailwind CSS            | Rapid UI development             |
| State           | Zustand                 | Simple, minimal boilerplate      |
| Markdown        | react-markdown          | Render AI responses              |
| Diff            | diff + react-diff-viewer| Generate and display diffs       |
| Syntax HL       | Shiki                   | VS Code quality highlighting     |
| File matching   | fast-glob               | Respects .gitignore              |
| Arg parsing     | commander               | Standard CLI arg parsing         |

## Implementation Phases

### Phase 1 - Foundation
- Scaffold pnpm workspace: root package.json + pnpm-workspace.yaml
- `packages/server` — Fastify server with WebSocket
- `packages/web` — React + Vite frontend with basic chat UI
- Connect frontend to backend via WebSocket
- Integrate DeepSeek provider, stream AI responses to browser
- Scripts: `pnpm dev` (runs both), `pnpm build`, `pnpm start`

### Phase 2 - Context & Tools
- File tree scanning (fast-glob, respecting .gitignore)
- Implement AI tools: read_file, search_files, list_directory, read_git_diff
- Tool handler to route AI tool calls to backend modules
- Baseline context builder (file tree + config files + git status)
- Token budget management and pruning
- Show tool calls in UI (e.g. "Reading src/App.tsx...")

### Phase 3 - Plan Mode
- System prompt for structured plan output (JSON)
- Parse AI response into plan steps
- PlanView component: display steps, toggle approve/skip
- Edit step details inline

### Phase 4 - Execution
- File create/edit via Node.js fs
- Shell command execution via child_process
- Diff generation and display in browser
- Step-by-step progress via WebSocket
- Success/error reporting per step

### Phase 5 - Multi-Provider
- Add Anthropic (Claude) provider
- Add generic OpenAI-compatible provider
- Settings page in web UI for API keys and model
- Provider/model switching

### Phase 6 - Polish
- File tree sidebar in UI
- Side-by-side diff viewer with syntax highlighting
- Rollback/undo support
- Conversation history persistence
- Dark/light theme
- Keyboard shortcuts (Cmd+Enter to send, etc.)
- `npm install -g brian-code` distribution

### Phase 7 - Project Switching
Currently the server is locked to `process.cwd()` at startup. This phase adds the ability to change the active project from the UI without restarting.

#### Backend (BE)
| ID | Title | Description |
|---|---|---|
| BE-P7-001 | POST /api/project/switch | Accept `{ path }`, validate directory exists, call `setProjectRoot()`, invalidate caches, reset context. Return new project info |
| BE-P7-002 | GET /api/project/current | Return current project root path and directory name |
| BE-P7-003 | Recent projects persistence | Store last 10 project paths in `~/.brian-code/config.json` under `recentProjects[]`, update on switch |
| BE-P7-004 | GET /api/project/recent | Return recent projects list with path, name, exists flag |
| BE-P7-005 | WebSocket broadcast on switch | Send `{ type: "project:switched", path, name }` to all connected clients |
| BE-P7-006 | Reset server state on switch | Clear session chat history, invalidate file tree cache, reset context builder, clear change tracker |

#### Frontend (FE)
| ID | Title | Description |
|---|---|---|
| FE-P7-001 | Project name in StatusBar | Show current folder name in status bar, clickable to open project switcher |
| FE-P7-002 | ProjectSwitcher modal | Modal with: current project path, recent projects list, manual path input, switch button |
| FE-P7-003 | Recent projects list | Show recent projects with name, path, exists indicator. Click to switch, remove stale entries |
| FE-P7-004 | Handle project:switched WS event | Clear chat, plan, execution state; refresh file tree; update status bar |
| FE-P7-005 | Keyboard shortcut Cmd/Ctrl+O | Open project switcher modal |

#### QA
| ID | Title | Description |
|---|---|---|
| QA-P7-001 | Test: switch project | Switch between directories, verify file tree updates, chat resets, context reflects new project |
| QA-P7-002 | Test: recent projects | Verify list persists across restarts, stale paths show indicator |
| QA-P7-003 | Test: invalid path | Enter non-existent path, verify error shown |

### Phase 8 - Conversation Management
Multiple conversations per project with persistent history. Users can create, switch between, and delete conversations. Each project has its own conversation list.

#### Backend (BE)
| ID | Title | Description |
|---|---|---|
| BE-P8-001 | Wire history into chat handler | Connect `addMessageToHistory()` to chat handler so all messages auto-persist to disk |
| BE-P8-002 | Load conversation endpoint | `POST /api/conversation/load/:id` — load saved conversation messages back into active chat context |
| BE-P8-003 | Delete conversation endpoint | `DELETE /api/history/:id` — delete conversation from disk, sanitize ID |
| BE-P8-004 | Filter history by project | `GET /api/history` returns only conversations for current project by default |
| BE-P8-005 | New conversation endpoint | `POST /api/conversation/new` — reset chat state, start fresh conversation, return ID |

#### Frontend (FE)
| ID | Title | Description |
|---|---|---|
| FE-P8-001 | Conversation list sidebar | History panel in sidebar showing conversations for current project |
| FE-P8-002 | Load conversation UI | Click conversation in list to load messages into chat view |
| FE-P8-003 | Delete conversation UI | Delete button with confirmation on each conversation entry |
| FE-P8-004 | New conversation button | "New Chat" button + wire Cmd+N to create new conversation on backend |
| FE-P8-005 | Active conversation indicator | Highlight active conversation in list, show title in UI |

#### QA
| ID | Title | Description |
|---|---|---|
| QA-P8-001 | Test: conversation CRUD | Create, persist, delete conversations |
| QA-P8-002 | Test: load conversation | Load past conversation, verify messages and AI context |
| QA-P8-003 | Test: project isolation | Conversations filtered by project after switching |
