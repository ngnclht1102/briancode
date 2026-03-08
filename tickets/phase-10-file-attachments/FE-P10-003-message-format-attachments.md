# FE-P10-003: Update Message Format with Attachments

**Phase:** 10 - File Mentions & Attachments
**Assignee:** FE (Frontend Dev)
**Priority:** Medium
**Dependencies:** FE-P10-001, FE-P10-002

## Description

Update the chat store and WebSocket send logic to include attachments (file mentions, documents, images) in the message payload. Update Chat.tsx to display attachments in sent messages.

## Implementation Details

### Chat Store Changes (`chatStore.ts`)

Add attachment support to the `Message` type:

```typescript
export interface MessageAttachment {
  type: "file_mention" | "document" | "image";
  filename: string;
  path?: string;           // for file_mention
  content?: string;        // for document
  mimeType?: string;       // for image
  data?: string;           // base64 for image
  thumbnailUrl?: string;   // for image preview in UI
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  toolCalls?: ToolCall[];
  attachments?: MessageAttachment[];  // NEW
}
```

### WebSocket Send Changes (`useWebSocket.ts`)

Update `sendMessage` to include attachments:

```typescript
sendMessage(text: string, attachments?: MessageAttachment[]) {
  ws.send(JSON.stringify({
    type: "chat",
    message: text,
    attachments: attachments?.map(a => ({
      type: a.type,
      path: a.path,
      filename: a.filename,
      content: a.content,
      mimeType: a.mimeType,
      data: a.data,
    }))
  }));
}
```

### Chat Display Changes (`Chat.tsx`)

Show attachments in user messages:
- File mentions: render as `@filename` pills (read-only)
- Documents: render as document chip with filename
- Images: render as inline thumbnail (clickable to expand)

### Input Flow Update

`Input.tsx` `handleSend`:
1. Collect `mentionedFiles` → map to `{ type: "file_mention", path, filename }`
2. Collect `attachments` → already typed
3. Pass to `onSend(text, attachments)`
4. Clear mentions and attachments after send

## Files to Modify
- `packages/web/src/stores/chatStore.ts` — Add `MessageAttachment` type, update `Message`
- `packages/web/src/hooks/useWebSocket.ts` — Update `sendMessage` signature
- `packages/web/src/components/Chat.tsx` — Render attachments in messages
- `packages/web/src/components/Input.tsx` — Wire mentions + attachments into send
- `packages/web/src/App.tsx` — Update onSend callback signature

## Acceptance Criteria
- [ ] Messages with attachments are stored in chat store
- [ ] WebSocket payload includes attachments array
- [ ] Sent messages display file mention pills
- [ ] Sent messages display document chips
- [ ] Sent messages display image thumbnails
- [ ] Attachments cleared from input after send
