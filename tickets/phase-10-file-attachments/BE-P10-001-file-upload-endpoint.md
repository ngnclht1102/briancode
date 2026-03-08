# BE-P10-001: File Upload Endpoint & Document Extraction

**Phase:** 10 - File Mentions & Attachments
**Assignee:** BE (Backend Dev)
**Priority:** High
**Dependencies:** None

## Description

Add a `POST /api/upload` endpoint that accepts file uploads, validates them, and extracts text content. Handles PDF text extraction, Word (.docx) text extraction, and image base64 encoding. Plain text documents are read as UTF-8.

## Implementation Details

### New Dependencies
```bash
yarn add @fastify/multipart pdf-parse mammoth
```

- **`pdf-parse`** — Extracts text from PDF files (reads binary buffer → returns plain text)
- **`mammoth`** — Extracts text from Word `.docx` files (reads binary → returns plain text)
- **`@fastify/multipart`** — Handles `multipart/form-data` file uploads in Fastify

### Endpoint: `POST /api/upload`

**Request:** `multipart/form-data` with a single file field

**Response:**
```json
{
  "filename": "document.pdf",
  "mimeType": "application/pdf",
  "size": 124500,
  "type": "document",
  "content": "extracted text content..."
}
```

For images:
```json
{
  "filename": "screenshot.png",
  "mimeType": "image/png",
  "size": 250000,
  "type": "image",
  "data": "base64-encoded-data..."
}
```

### Validation
- Max file size: 10MB for documents, 20MB for images
- Allowed document MIME types: `text/plain`, `text/markdown`, `text/csv`, `application/json`, `application/xml`, `text/xml`, `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (.docx)
- Allowed image MIME types: `image/png`, `image/jpeg`, `image/gif`, `image/webp`
- Validate actual file content (not just extension/Content-Type)
- Return 400 with descriptive error for invalid files

### Extraction Methods

**PDF** — `readFile()` cannot handle binary PDF. Use `pdf-parse`:
```typescript
import pdfParse from "pdf-parse";

async function extractPdfText(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}
```

**Word (.docx)** — `readFile()` cannot handle ZIP-based .docx format. Use `mammoth`:
```typescript
import mammoth from "mammoth";

async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
```

**Images** — `readFile()` detects binary and skips. Instead, read raw buffer → base64:
```typescript
function encodeImage(buffer: Buffer, mimeType: string): string {
  return buffer.toString("base64");
  // Sent to AI provider as multimodal content block
}
```

**Plain text** (`.txt`, `.md`, `.csv`, `.json`, `.xml`, `.log`) — read as UTF-8 string:
```typescript
const content = buffer.toString("utf-8");
```

### File Processing Logic
1. Receive multipart upload
2. Validate MIME type and size
3. Route by type:
   - PDF → extract text via `pdf-parse`
   - .docx → extract text via `mammoth`
   - Image → convert to base64
   - Other document → read as UTF-8 text
4. Return processed result
5. No persistent storage (process in memory, discard after response)

## Files to Create/Modify
- **Create:** `packages/server/src/server/upload-handler.ts`
- **Modify:** `packages/server/src/server/router.ts` — Register upload endpoint
- **Modify:** `packages/server/src/server/server.ts` — Register `@fastify/multipart`

## Acceptance Criteria
- [ ] `POST /api/upload` accepts multipart file uploads
- [ ] PDF files are parsed and text content returned
- [ ] Word (.docx) files are parsed and text content returned
- [ ] Text documents return raw content
- [ ] Images return base64-encoded data
- [ ] File size limits enforced (400 error if exceeded)
- [ ] Invalid MIME types rejected (400 error)
- [ ] No files stored on disk (memory-only processing)
- [ ] Proper error messages for all failure cases
