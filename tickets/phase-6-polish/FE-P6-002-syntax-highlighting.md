# FE-P6-002: Syntax Highlighting with Shiki

**Phase:** 6 - Polish
**Assignee:** FE (Frontend Dev)
**Priority:** Medium
**Dependencies:** FE-P4-003

## Description
Replace basic code highlighting with Shiki for VS Code-quality syntax highlighting in chat messages and diff views.

## Acceptance Criteria
- [ ] Integrate Shiki for code block highlighting in Chat component
- [ ] Integrate Shiki in DiffView for highlighted diffs
- [ ] Support common languages: TypeScript, JavaScript, Python, CSS, HTML, JSON, YAML, Bash
- [ ] Auto-detect language from code fence markers or file extension
- [ ] Theme: match the app's dark/light theme
- [ ] Lazy-load Shiki (it's large) — show plain code until loaded
- [ ] Line numbers in code blocks

## Notes
- Shiki uses VS Code's TextMate grammars — same highlighting quality
- Load only needed language grammars to reduce bundle size

## Mock Strategy (for parallel development)
- Develop as standalone component with hardcoded code blocks
- Test Shiki integration with sample code in multiple languages
- No external dependency — pure frontend feature
