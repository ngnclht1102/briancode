# AQA-P10-001: E2E Tests — Phase 10

**Phase:** 10 - File Mentions & Attachments
**Assignee:** AQA (Automation QA)
**Priority:** High
**Dependencies:** TL-P10-001

## Test Cases

### @ File Mentions
1. Type `@` → assert popup is visible
2. Type `@app` → assert filtered results contain matching files
3. Select file via keyboard → assert pill appears in input area
4. Press Escape → assert popup is dismissed
5. Send message with mention → assert WebSocket payload contains `attachments` with `file_mention`

### Document Upload
6. Click paperclip → upload .txt file → assert chip appears
7. Upload .pdf → assert chip appears with extracted content
8. Drag-and-drop .md file → assert chip appears
9. Upload file > 10MB → assert error message visible
10. Upload unsupported type → assert error message visible

### Image Upload
11. Upload .png via button → assert thumbnail chip appears
12. Drag-and-drop .jpg → assert thumbnail chip appears
13. Upload image > 20MB → assert error message visible
14. Send with image → assert WebSocket payload contains `image` attachment

### Integration
15. Send message with all attachment types → assert AI response references all
16. Regenerate message with attachments → assert attachments preserved

### API Tests
17. `POST /api/upload` with PDF → assert 200 + text content in response
18. `POST /api/upload` with image → assert 200 + base64 in response
19. `POST /api/upload` with oversized file → assert 400
20. `POST /api/upload` with invalid type → assert 400

### Regression
21. Plain text chat still works end-to-end
22. Tool calls still execute correctly
