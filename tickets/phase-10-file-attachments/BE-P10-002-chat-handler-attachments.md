# BE-P10-002: Chat Handler Attachment Processing

**Phase:** 10 - File Mentions & Attachments
**Assignee:** BE (Backend Dev)
**Priority:** High
**Dependencies:** None (mock attachment data)

## Description

Update the chat handler to process attachments in incoming chat messages. File mentions are resolved to file content, documents and images are formatted into the conversation history for the AI provider.

## Implementation Details

### Updated WebSocket Message Format

```typescript
interface ChatMessagePayload {
  type: "chat";
  message: string;
  attachments?: Array<{
    type: "file_mention" | "document" | "image";
    path?: string;        // file_mention
    filename?: string;
    content?: string;     // document text
    mimeType?: string;    // image
    data?: string;        // image base64
  }>;
}
```

### Attachment Processing in `chatHandler()`

Before pushing the user message to `conversationHistory`:

1. **File Mentions** — Read file content using one of two approaches:

   **Option A: Reuse existing `readFile()` from `file-reader.ts`**
   - Already has path traversal protection via `resolveProjectPath()`
   - Already handles binary detection and missing files
   - BUT: adds line numbers (`1\tcode`) and truncates at 200 lines — format is designed for AI tool output, not raw context

   **Option B (Recommended): Add a new `readFileRaw()` function in `file-reader.ts`**
   ```typescript
   export function readFileRaw(relativePath: string, maxBytes = 50_000): string {
     const absPath = resolveProjectPath(relativePath);
     if (!absPath) return `Error: Path traversal blocked for "${relativePath}"`;
     if (!fs.existsSync(absPath)) return `Error: File not found: ${relativePath}`;
     // binary detection (same as readFile)
     // read as UTF-8, truncate at maxBytes
     // NO line numbers, NO 200-line limit
   }
   ```
   This gives clean content for AI context without line-number formatting.

   Output format in the composed message:
   ```
   --- File: src/server.ts ---
   <raw file content, max 50KB>
   ---
   ```

2. **Documents** — Prepend extracted content:
   ```
   --- Document: notes.pdf ---
   <extracted text>
   ---
   ```

3. **Images** — AI models do NOT understand raw base64 text. Images must be sent as **structured content blocks** in the API request. The base64 is just transport encoding — the provider API decodes it and feeds actual image pixels to the vision model.

### Composed User Message

**Text-only message (no images):** content stays as a plain string:
```
<attachments>
--- File: src/server.ts ---
import fastify from "fastify";
...
---

--- Document: requirements.pdf ---
The system shall...
---
</attachments>

<user_message>
Please review this code against the requirements
</user_message>
```

**Message with images:** content MUST become an array of content blocks (not a plain string). This is because AI providers require images as separate structured objects — they cannot be embedded inline in text.

```typescript
// Example: user sends "What's in this screenshot?" with an image
conversationHistory.push({
  role: "user",
  content: [
    {
      type: "text",
      text: "<attachments>\n--- File: src/server.ts ---\n...\n---\n</attachments>\n\n<user_message>\nWhat's in this screenshot?\n</user_message>"
    },
    {
      type: "image",
      mimeType: "image/png",
      data: "iVBORw0KGgo..."  // base64 — NOT for AI to read as text
    }
  ]
});
```

Each provider then converts this internal format to their specific API format:
- **Anthropic** → `{ type: "image", source: { type: "base64", media_type, data } }`
- **OpenAI** → `{ type: "image_url", image_url: { url: "data:image/png;base64,..." } }`
- **DeepSeek** → strip image, add `[Image: filename — model does not support vision]`

See **BE-P10-003** for provider conversion details.

### ChatMessage Type Update (`providers/types.ts`)

```typescript
interface TextContent {
  type: "text";
  text: string;
}

interface ImageContent {
  type: "image";
  mimeType: string;
  data: string; // base64 — transport encoding, NOT shown to model as text
}

type MessageContent = string | Array<TextContent | ImageContent>;

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: MessageContent;  // was: string
  tool_calls?: ...;
  tool_call_id?: string;
}
```

**Important:** When `content` is a plain string (no images), providers pass it through unchanged. When `content` is an array (has images), each provider converts to their API-specific multimodal format in their `chat()` method.

### Security
- File mention paths validated via `resolveProjectPath()` (existing, prevents path traversal)
- File read errors handled gracefully (include error message in context instead of crashing)
- Large file content truncated (max 50KB per file, with note)

## Files to Modify
- `packages/server/src/server/chat-handler.ts` — Process attachments, compose message
- `packages/server/src/server/ws-handler.ts` — Pass full payload to chatHandler (not just message string)
- `packages/server/src/providers/types.ts` — Update `ChatMessage.content` to support multimodal

## Acceptance Criteria
- [ ] File mention paths resolved and content read
- [ ] Path traversal blocked for file mentions
- [ ] Document text included in user message context
- [ ] Image data passed through as multimodal content
- [ ] Large files truncated with notice
- [ ] Missing/unreadable files produce graceful error in context
- [ ] Plain text messages (no attachments) still work unchanged
