# P2-010: Manual QA — Phase 2 Context & Tools

**Phase:** 2 - Context & Tools
**Assignee:** MQA (Manual QA)
**Priority:** High
**Dependencies:** P2-006, P2-008

## Description
Manually test context gathering, AI tool usage, Agents.md behavior, and tool call UI display.

## Test Cases

### TC-2.1: File Tree Context
- [ ] AI mentions correct project structure when asked "What files are in this project?"
- [ ] Large project (1000+ files) doesn't cause timeout
- [ ] `.gitignore`-d files are not included in context
- [ ] `node_modules` never appears in file tree

### TC-2.2: AI Tool — read_file
- [ ] Ask "What's in package.json?" → AI reads and describes the file
- [ ] Ask about a specific function → AI reads the correct file
- [ ] Ask about a non-existent file → AI handles gracefully
- [ ] Large file → AI gets truncated version with line range hint

### TC-2.3: AI Tool — search_files
- [ ] Ask "Where is the login function defined?" → AI searches and finds it
- [ ] Search with no results → AI says it couldn't find matches
- [ ] Search across specific file types → AI uses glob correctly

### TC-2.4: AI Tool — list_directory & git
- [ ] Ask "What's in the src folder?" → AI lists directory contents
- [ ] Ask "What files have I changed?" → AI shows git status
- [ ] Non-git project → AI handles gracefully ("Not a git repository")

### TC-2.5: Tool Calls in UI
- [ ] Tool calls appear as collapsible blocks in chat
- [ ] Shows spinner while tool is executing
- [ ] Tool result visible when expanded
- [ ] Multiple sequential tool calls display in order

### TC-2.6: Agents.md
- [ ] Create `Agents.md` with rule "Always respond in Spanish" → AI follows rule
- [ ] Edit `Agents.md` while running → changes take effect on next message (no restart)
- [ ] Delete `Agents.md` → AI works normally without it
- [ ] No `Agents.md` in project → no errors, AI works normally

### TC-2.7: Security
- [ ] Ask AI to read `/etc/passwd` → blocked, cannot read outside project root
- [ ] Ask AI to read `../../secrets.txt` → path traversal blocked

## Environment
- [ ] Test with small project (<50 files)
- [ ] Test with medium project (200-500 files)
- [ ] Test with large project (1000+ files)
