# MQA-P10-001: Manual QA — Phase 10

**Phase:** 10 - File Mentions & Attachments
**Assignee:** MQA (Manual QA)
**Priority:** High
**Dependencies:** TL-P10-001

## Test Scenarios

### @ File Mentions
1. Type `@` → popup opens with project files
2. Type `@ser` → filters to files containing "ser"
3. Arrow down → highlight moves, Enter → selects file
4. Escape → closes popup without selection
5. Select 3+ files → all show as pills
6. Remove a pill → mention removed
7. Send message with mention → AI references the file content
8. Type `@` with empty project → shows "no files" or empty state

### Document Upload
9. Click paperclip → file picker opens (correct file types)
10. Select a .txt file → chip appears with filename
11. Select a .pdf file → chip appears after extraction
12. Drag .md file onto input → chip appears
13. Try uploading > 10MB file → error message shown
14. Try uploading .exe file → rejected
15. Upload multiple documents → all show as chips
16. Send with document → AI references document content

### Image Upload
17. Click paperclip → select .png → thumbnail chip appears
18. Drag .jpg onto input → thumbnail chip appears
19. Cmd+V paste screenshot → thumbnail chip appears
20. Try uploading > 20MB image → error message shown
21. Send with image → AI describes/analyzes the image
22. Upload multiple images → all show thumbnails

### Combined Scenarios
23. @ mention + document + image + text → all sent correctly
24. @ mention a file that was just deleted → graceful error
25. Send, then regenerate → attachments preserved in context
26. New conversation → attachments cleared
27. Switch provider → verify image handling (Anthropic vs DeepSeek)

### Regression
28. Plain text messages still work normally
29. Tool calls still work
30. Conversation history loads correctly
31. Plan mode unaffected
