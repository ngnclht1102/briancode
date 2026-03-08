# BE-P10-003: Provider Multimodal Support (Images)

**Phase:** 10 - File Mentions & Attachments
**Assignee:** BE (Backend Dev)
**Priority:** High
**Dependencies:** BE-P10-002 (ChatMessage type update)

## Description

Update all AI provider adapters to handle multimodal content (text + images) in messages.

**Key concept:** AI models do NOT read base64 strings as text. The base64 is a transport encoding — each provider's API decodes it server-side and feeds actual image pixels to the vision model. Each provider has a different API format for how to send that base64 data.

## How It Works (End-to-End)

```
User uploads image
    ↓
Frontend: reads file → base64 string
    ↓
WebSocket: sends { type: "chat", message: "...", attachments: [{ type: "image", data: "base64..." }] }
    ↓
chat-handler: builds ChatMessage with content: [{ type: "text", text: "..." }, { type: "image", data: "base64..." }]
    ↓
Provider adapter: converts internal format → provider-specific API format
    ↓
Anthropic API / OpenAI API: decodes base64 → feeds image pixels to vision model
    ↓
AI model: "sees" the actual image and responds
```

## Implementation Details

### Anthropic Provider (`anthropic.ts`)

Anthropic API expects images as `source.data` (raw base64, no data-URL prefix):

```typescript
// Internal format (from chat-handler):
{ type: "image", mimeType: "image/png", data: "iVBORw0KGgo..." }

// Converted to Anthropic API format:
{
  type: "image",
  source: {
    type: "base64",
    media_type: "image/png",   // Anthropic uses media_type
    data: "iVBORw0KGgo..."     // raw base64, no prefix
  }
}
```

### OpenAI-Compatible Provider (`openai-compat.ts`)

OpenAI API expects images as a data URL inside `image_url.url`:

```typescript
// Internal format (from chat-handler):
{ type: "image", mimeType: "image/png", data: "iVBORw0KGgo..." }

// Converted to OpenAI API format:
{
  type: "image_url",
  image_url: {
    url: "data:image/png;base64,iVBORw0KGgo...",  // data URL with prefix
    detail: "auto"
  }
}
```

### DeepSeek Provider (`deepseek.ts`)

DeepSeek chat API does NOT support vision. When image content blocks are present:
- Log a warning
- Strip image blocks entirely
- Append fallback text: `[Image attached: {filename} — this model does not support image analysis]`
- Only the text portion of the message is sent

### Message Conversion Helper

Create a shared utility that each provider calls in its `chat()` method:

```typescript
// packages/server/src/providers/message-converter.ts

// Convert internal MessageContent → Anthropic API content format
function convertToAnthropicContent(content: MessageContent): AnthropicContent

// Convert internal MessageContent → OpenAI API content format
function convertToOpenAIContent(content: MessageContent): OpenAIContent

// Strip images, return text only (for non-vision models like DeepSeek)
function stripImages(content: MessageContent): string
```

### Provider Interface Update — `supportsVision` flag

> **Already implemented** in `types.ts`, `anthropic.ts`, `deepseek.ts`, `openai-compat.ts`, and `router.ts`.

Each provider now declares whether it supports vision:

```typescript
// types.ts
export interface AIProvider {
  name: string;
  supportsVision?: boolean;  // NEW — defaults to false
  chat(...): AsyncIterable<StreamEvent>;
}
```

| Provider | `supportsVision` | Notes |
|----------|-----------------|-------|
| `anthropic` | `true` | Claude models support vision natively |
| `openai-compat` | `true` (default) | Most OpenAI-compatible APIs (GPT-4o, etc.) support vision |
| `deepseek` | `false` | DeepSeek chat API has no vision support |
| `ollama` | `true` (default, inherited) | Depends on model — some Ollama models support vision, some don't. Default to true, let it fail gracefully |
| `groq` | `true` (default, inherited) | Llama vision models available |
| `kimi` | `true` (default, inherited) | Moonshot supports vision |

The flag is exposed via REST API:
- `GET /api/provider/current` → `{ provider: "anthropic", supportsVision: true }`
- `POST /api/provider/switch` → `{ success: true, provider: "deepseek", supportsVision: false }`

**Frontend uses this to:**
- Show/hide the image upload button
- Show a tooltip "Current provider does not support images" if disabled
- Reject image paste/drop with a message when vision is unavailable

Each provider's `chat()` method handles the conversion internally by checking if `content` is a string or array.

## Files to Create/Modify
- **Create:** `packages/server/src/providers/message-converter.ts`
- **Modify:** `packages/server/src/providers/anthropic.ts` — Convert multimodal content
- **Modify:** `packages/server/src/providers/openai-compat.ts` — Convert multimodal content
- **Modify:** `packages/server/src/providers/deepseek.ts` — Strip images with warning

## Acceptance Criteria
- [ ] Anthropic provider sends images in correct format
- [ ] OpenAI-compatible provider sends images in correct format
- [ ] DeepSeek provider gracefully handles images (text fallback)
- [ ] Text-only messages pass through unchanged (no regression)
- [ ] Mixed text + image messages work correctly
- [ ] Multiple images in one message work
- [ ] Base64 encoding is valid in all provider formats
