# BE-P8-002: Load Conversation into Chat Handler

**Phase:** 8 - Conversation Management
**Assignee:** BE (Backend Dev)
**Priority:** Critical
**Dependencies:** BE-P8-001

## Description
Allow loading a previously saved conversation back into the active chat handler so the AI has full context from the previous session.

## Acceptance Criteria
- [ ] `POST /api/conversation/load/:id` endpoint
- [ ] Loads conversation from disk via `loadConversation(id)`
- [ ] Replaces current `conversationHistory` array with loaded messages (converted to ChatMessage format)
- [ ] Rebuilds system prompt for the loaded conversation
- [ ] Sets loaded conversation as the active conversation in history module
- [ ] Returns `{ success: true, conversation: { id, title, messageCount } }` on success
- [ ] Returns `{ success: false, error: "Not found" }` if conversation doesn't exist
- [ ] Sends loaded messages to the requesting client via WS: `{ type: "conversation:loaded", messages: [...] }`

## Technical Notes
- Need to convert stored messages back to `ChatMessage[]` format (role + content + tool_calls)
- System prompt must be re-injected at the start
- Tool call results need to be mapped back to `tool_call_id` format
- Consider: only load user + assistant messages, skip tool messages to save context

## Mock Strategy
- Create a conversation file manually, test loading via curl
