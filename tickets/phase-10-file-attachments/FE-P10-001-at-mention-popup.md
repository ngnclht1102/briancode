# FE-P10-001: @ File Mention Popup Component

**Phase:** 10 - File Mentions & Attachments
**Assignee:** FE (Frontend Dev)
**Priority:** High
**Dependencies:** None (mock file list)

## Description

Build a popup component that appears when the user types `@` in the chat input. The popup shows a filterable list of project files. Selecting a file inserts a mention pill into the input area.

## Implementation Details

### New Component: `FileMentionPopup.tsx`

```
packages/web/src/components/FileMentionPopup.tsx
```

- Triggered when `@` is typed in the textarea
- Positioned above the input area (absolute/portal)
- Shows file list from `/api/files` endpoint (already exists)
- Fuzzy-filters as user types characters after `@`
- Keyboard navigation: Arrow Up/Down to navigate, Enter/Tab to select, Escape to close
- Max 8 items visible, scrollable
- Highlights matching characters in file paths
- Closes when clicking outside

### Mention Tracking

- Maintain a `mentionedFiles: string[]` state in the Input component
- When a file is selected, insert it into the mentions array
- Display mentions as pills/chips above the textarea (inside the input container)
- Each pill has an `×` button to remove
- When sending, pass `mentionedFiles` along with the message text

### Mock Data (Step 1)
```typescript
const MOCK_FILES = [
  "src/server.ts",
  "src/App.tsx",
  "src/components/Chat.tsx",
  "src/components/Input.tsx",
  "src/stores/chatStore.ts",
  "package.json",
  "tsconfig.json",
];
```

## Files to Create/Modify
- **Create:** `packages/web/src/components/FileMentionPopup.tsx`
- **Modify:** `packages/web/src/components/Input.tsx` — Add mention state, `@` detection, popup trigger, pills display

## Acceptance Criteria
- [ ] Typing `@` opens the popup with file list
- [ ] Typing after `@` fuzzy-filters results
- [ ] Arrow keys navigate, Enter selects, Escape closes
- [ ] Selected file appears as pill above textarea
- [ ] Multiple mentions supported
- [ ] Pills can be removed via `×` button
- [ ] Popup closes on outside click
- [ ] Works with mock data (real API wired in integration)
