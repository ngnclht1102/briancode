# FE-P10-002: Attachment Button & File Upload UI

**Phase:** 10 - File Mentions & Attachments
**Assignee:** FE (Frontend Dev)
**Priority:** High
**Dependencies:** None (mock upload)

## Description

Add an attachment button (paperclip icon) to the input area and support drag-and-drop file upload. Handle both documents and images with appropriate preview UI.

## Implementation Details

### UI Changes to `Input.tsx`

1. **Paperclip button** — Left of the textarea, opens native file picker
2. **Drag-and-drop zone** — The entire input area accepts file drops
3. **Attachment chips** — Displayed above the textarea alongside mention pills

### Attachment Chip Types

**Document chip:**
```
┌─────────────────────┐
│ 📄 notes.pdf (24KB) × │
└─────────────────────┘
```

**Image chip (with thumbnail):**
```
┌─────────────────────────┐
│ [thumb] screenshot.png × │
└─────────────────────────┘
```

### New Component: `AttachmentChip.tsx`

```
packages/web/src/components/AttachmentChip.tsx
```

- Renders document or image attachment preview
- Image: small thumbnail (32x32) + filename
- Document: file icon + filename + size
- `×` button to remove
- Loading state during upload

### File Handling Logic

1. **On file select/drop:**
   - Check file type → image or document
   - Check file size (10MB for docs, 20MB for images)
   - Show error toast if invalid
   - For images: create local thumbnail via `URL.createObjectURL()`
   - For documents: read as text (client-side for txt/md/csv/json/xml/log)
   - For PDF: upload to server for extraction (POST `/api/upload`)
2. **State:** `attachments: Attachment[]` in Input component

### Clipboard Paste (Images)
- Listen for `paste` event on textarea
- If clipboard contains image data, treat as image upload
- Create blob from clipboard item and process as file

### Types
```typescript
interface Attachment {
  id: string;
  type: "document" | "image";
  filename: string;
  size: number;
  mimeType: string;
  // For documents:
  content?: string;         // extracted text
  // For images:
  data?: string;            // base64 data
  thumbnailUrl?: string;    // object URL for preview
  // State:
  status: "uploading" | "ready" | "error";
  error?: string;
}
```

### Vision-Aware UI

Image upload is only available when the current provider supports it.

- Fetch `GET /api/provider/current` → check `supportsVision` field
- When `supportsVision === false`:
  - Grey out image option in file picker (or filter to documents only)
  - If user pastes/drops an image, show: "Current provider ({name}) does not support image analysis"
  - Document upload (PDF, docx, txt) remains always available
- When provider is switched, re-check `supportsVision`

### Mock (Step 1)
- Document content read client-side via FileReader
- PDF upload mocked (return placeholder text)
- No actual server upload needed for Step 1
- Mock `supportsVision` as `true`

## Files to Create/Modify
- **Create:** `packages/web/src/components/AttachmentChip.tsx`
- **Modify:** `packages/web/src/components/Input.tsx` — Add paperclip button, drag-drop, paste handler, attachment state

## Acceptance Criteria
- [ ] Paperclip button opens file picker
- [ ] Drag-and-drop shows drop zone indicator and accepts files
- [ ] Image files show thumbnail preview chip
- [ ] Document files show filename + size chip
- [ ] Paste image from clipboard works
- [ ] File size validation with error message
- [ ] File type validation with error message
- [ ] Attachments removable via `×`
- [ ] Multiple attachments supported
- [ ] Loading state shown during processing
- [ ] Image upload disabled when provider `supportsVision === false`
- [ ] Clear message shown when image rejected due to no vision support
