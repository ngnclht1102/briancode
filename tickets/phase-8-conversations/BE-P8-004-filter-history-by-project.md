# BE-P8-004: Filter History by Project

**Phase:** 8 - Conversation Management
**Assignee:** BE (Backend Dev)
**Priority:** High
**Dependencies:** None

## Description
Enhance the `GET /api/history` endpoint to filter conversations by the current project path, so users only see conversations relevant to the project they're working on.

## Acceptance Criteria
- [ ] `GET /api/history` defaults to returning only conversations for the current project
- [ ] `GET /api/history?all=true` returns all conversations across all projects
- [ ] Each conversation entry includes `projectPath` and `projectName` fields
- [ ] Results sorted by most recent first (by `startedAt` date)
- [ ] Empty list returned if no conversations for current project

## Technical Notes
- `listConversations()` already reads `projectPath` from stored JSON
- Filter by comparing `projectPath` against `getProjectRoot()`
- Add optional `projectPath` parameter to `listConversations()`

## Mock Strategy
- Create conversations with different `projectPath` values, verify filtering
