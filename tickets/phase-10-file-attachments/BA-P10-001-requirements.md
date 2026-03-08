# BA-P10-001: Phase 10 Requirements — File Mentions & Attachments

**Phase:** 10 - File Mentions & Attachments
**Assignee:** BA (Business Analyst)
**Priority:** High
**Dependencies:** None

## Overview

Phase 10 introduces three ways for users to attach context to their chat messages:

1. **@ File Mentions** — Type `@` in the input to search and reference project files
2. **Document Upload** — Upload `.txt`, `.md`, `.pdf`, `.csv`, `.json`, `.xml`, `.log` files
3. **Image Upload** — Upload `.png`, `.jpg`, `.gif`, `.webp` images for multimodal AI analysis

## Feature 1: @ File Mentions

### User Flow
1. User types `@` in the chat input
2. A popup appears above the input showing project files (filtered from `/api/files`)
3. User types further characters to fuzzy-filter the file list
4. User clicks or presses Enter/Tab to select a file
5. A pill/chip appears in the input area showing the selected file (e.g., `@src/server.ts`)
6. User can select multiple files by typing `@` again
7. User can remove a mention by clicking the `×` on the pill or pressing Backspace into it
8. On send, the content of each mentioned file is read and prepended to the message as context

### Acceptance Criteria
- [ ] Typing `@` opens the file picker popup
- [ ] File list is filtered as user types after `@`
- [ ] Fuzzy matching works (e.g., `@srv` matches `src/server.ts`)
- [ ] Selected file appears as a removable pill/chip
- [ ] Multiple files can be mentioned in one message
- [ ] Pressing Escape closes the popup without selecting
- [ ] Arrow keys navigate the popup list
- [ ] Mentioned files' contents are sent as context with the message
- [ ] File mentions work correctly with regular message text
- [ ] Popup positions correctly (above input, no overflow)

## Feature 2: Document Upload

### User Flow
1. User clicks the attachment (paperclip) button or drags a file onto the input area
2. Supported document types: `.txt`, `.md`, `.pdf`, `.docx`, `.csv`, `.json`, `.xml`, `.log`
3. File is uploaded to the server, content is extracted (text for most, parsed for PDF)
4. A chip appears in the input area showing filename + size
5. On send, extracted text content is prepended to the message as context
6. Max file size: 10MB

### Acceptance Criteria
- [ ] Paperclip button opens native file picker with correct accept types
- [ ] Drag-and-drop works on the input area
- [ ] PDF text extraction works correctly
- [ ] Upload progress indicator shows during upload
- [ ] Uploaded file appears as removable chip
- [ ] File content is included in the message context
- [ ] Files exceeding 10MB are rejected with clear error message
- [ ] Unsupported file types are rejected with clear error message
- [ ] Multiple documents can be attached to one message

## Feature 3: Image Upload

### User Flow
1. User clicks the attachment button or drags an image onto the input area
2. Supported: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`
3. Image is uploaded to the server and stored temporarily
4. A thumbnail preview appears in the input area
5. On send, the image is sent as a base64-encoded attachment for multimodal AI processing
6. Max file size: 20MB

### Acceptance Criteria
- [ ] Image upload via button and drag-and-drop
- [ ] Thumbnail preview in input area
- [ ] Image is sent as base64 in the message payload
- [ ] Provider adapters handle image content correctly (Anthropic vision, OpenAI vision)
- [ ] Images exceeding 20MB are rejected
- [ ] Non-image files are routed to document upload
- [ ] Paste from clipboard (Cmd/Ctrl+V) works for images
- [ ] Multiple images can be attached to one message

## Technical Requirements

### New Dependencies
- **Server:** `pdf-parse` — PDF text extraction
- **Server:** `mammoth` — Word (.docx) text extraction
- **Server:** `@fastify/multipart` — File upload handling
- **Web:** No new dependencies expected (native File API + FileReader)

### Message Format Changes
Current message format:
```json
{ "type": "chat", "message": "string" }
```

New message format:
```json
{
  "type": "chat",
  "message": "string",
  "attachments": [
    {
      "type": "file_mention",
      "path": "src/server.ts"
    },
    {
      "type": "document",
      "filename": "notes.pdf",
      "content": "extracted text content..."
    },
    {
      "type": "image",
      "filename": "screenshot.png",
      "mimeType": "image/png",
      "data": "base64-encoded-data..."
    }
  ]
}
```

### Provider Multimodal Support
- **Anthropic:** Native image support via `image` content blocks
- **OpenAI/DeepSeek:** Image support via `image_url` content blocks
- Providers without vision should receive image description fallback text
- Text attachments (file mentions + documents) are injected as user message context

### Security Considerations
- File mention paths must be validated against project root (no path traversal)
- Upload file size limits enforced server-side
- Uploaded files stored in temp directory, cleaned up after processing
- MIME type validation on server (don't trust client Content-Type)
- Sanitize extracted text content (no injection into system prompt)
