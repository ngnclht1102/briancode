import { useState, useRef, useEffect, type KeyboardEvent, type RefObject, type DragEvent, type ClipboardEvent } from "react";
import { useChatStore, type MessageAttachment } from "../stores/chatStore";
import FileMentionPopup from "./FileMentionPopup";
import AttachmentChip from "./AttachmentChip";

interface InputProps {
  onSend: (message: string, attachments?: MessageAttachment[]) => void;
  onStop: () => void;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  supportsVision?: boolean;
}

interface LocalAttachment {
  id: string;
  type: "file_mention" | "document" | "image";
  filename: string;
  path?: string;
  content?: string;
  mimeType?: string;
  data?: string;
  size?: number;
  thumbnailUrl?: string;
  status: "uploading" | "ready" | "error";
  error?: string;
}

let attachmentCounter = 0;

export default function Input({ onSend, onStop, inputRef, supportsVision = true }: InputProps) {
  const [text, setText] = useState("");
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = inputRef ?? internalRef;
  const isLoading = useChatStore((s) => s.isLoading);

  // @ mention state
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [mentionStartPos, setMentionStartPos] = useState(-1);
  const [projectFiles, setProjectFiles] = useState<string[]>([]);

  // Attachments state
  const [attachments, setAttachments] = useState<LocalAttachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch project files for @ mention
  useEffect(() => {
    fetch("/api/files")
      .then((r) => r.json())
      .then((data: { files?: Array<{ path: string }> }) => {
        if (data.files) setProjectFiles(data.files.map((f) => f.path));
      })
      .catch(() => {});
  }, []);

  // Refresh files on filetree change
  useEffect(() => {
    const handler = () => {
      fetch("/api/files")
        .then((r) => r.json())
        .then((data: { files?: Array<{ path: string }> }) => {
          if (data.files) setProjectFiles(data.files.map((f) => f.path));
        })
        .catch(() => {});
    };
    window.addEventListener("filetree:refresh", handler);
    return () => window.removeEventListener("filetree:refresh", handler);
  }, []);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) return;
    if (isLoading) return;

    const readyAttachments = attachments.filter((a) => a.status === "ready");
    const messageAttachments: MessageAttachment[] = readyAttachments.map((a) => ({
      type: a.type,
      filename: a.filename,
      path: a.path,
      content: a.content,
      mimeType: a.mimeType,
      data: a.data,
      thumbnailUrl: a.thumbnailUrl,
    }));

    onSend(trimmed || "(see attachments)", messageAttachments.length > 0 ? messageAttachments : undefined);
    setText("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleTextChange = (value: string) => {
    setText(value);

    // Detect @ mention
    const el = textareaRef.current;
    if (!el) return;

    const cursorPos = el.selectionStart;
    const textBefore = value.slice(0, cursorPos);

    // Find the last @ before cursor that isn't preceded by a word character
    const atMatch = textBefore.match(/(^|[^\w])@([^@\s]*)$/);
    if (atMatch) {
      const query = atMatch[2];
      setMentionQuery(query);
      setMentionStartPos(cursorPos - query.length - 1);
      setShowMentionPopup(true);
    } else {
      setShowMentionPopup(false);
    }
  };

  const handleMentionSelect = (filePath: string) => {
    // Replace the @query with nothing, add as attachment
    const before = text.slice(0, mentionStartPos);
    const after = text.slice(mentionStartPos + mentionQuery.length + 1);
    setText(before + after);
    setShowMentionPopup(false);

    // Add file mention attachment
    setAttachments((prev) => [
      ...prev,
      {
        id: `att-${++attachmentCounter}`,
        type: "file_mention",
        filename: filePath.split("/").pop() ?? filePath,
        path: filePath,
        status: "ready",
      },
    ]);

    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentionPopup) {
      // Let the popup handle arrow keys, enter, tab, escape
      if (["ArrowDown", "ArrowUp", "Enter", "Tab", "Escape"].includes(e.key)) {
        return; // popup handles via window listener
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  };

  // File processing
  const processFile = async (file: File) => {
    const isImage = file.type.startsWith("image/");

    if (isImage && !supportsVision) {
      // Show error attachment
      setAttachments((prev) => [
        ...prev,
        {
          id: `att-${++attachmentCounter}`,
          type: "image",
          filename: file.name,
          size: file.size,
          status: "error",
          error: "Current provider does not support image analysis",
        },
      ]);
      return;
    }

    const maxSize = isImage ? 20 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setAttachments((prev) => [
        ...prev,
        {
          id: `att-${++attachmentCounter}`,
          type: isImage ? "image" : "document",
          filename: file.name,
          size: file.size,
          status: "error",
          error: `File too large (max ${isImage ? "20" : "10"}MB)`,
        },
      ]);
      return;
    }

    const attId = `att-${++attachmentCounter}`;

    if (isImage) {
      // Read as base64 for images
      const thumbnailUrl = URL.createObjectURL(file);
      setAttachments((prev) => [
        ...prev,
        { id: attId, type: "image", filename: file.name, size: file.size, mimeType: file.type, thumbnailUrl, status: "uploading" },
      ]);

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        setAttachments((prev) =>
          prev.map((a) => (a.id === attId ? { ...a, data: base64, status: "ready" as const } : a)),
        );
      };
      reader.readAsDataURL(file);
    } else {
      // Document handling
      const needsServerExtraction = file.type === "application/pdf" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      setAttachments((prev) => [
        ...prev,
        { id: attId, type: "document", filename: file.name, size: file.size, mimeType: file.type, status: "uploading" },
      ]);

      if (needsServerExtraction) {
        // Upload to server for PDF/docx extraction
        const formData = new FormData();
        formData.append("file", file);
        try {
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Upload failed");
          setAttachments((prev) =>
            prev.map((a) => (a.id === attId ? { ...a, content: data.content, status: "ready" as const } : a)),
          );
        } catch (err) {
          setAttachments((prev) =>
            prev.map((a) => (a.id === attId ? { ...a, status: "error" as const, error: String(err) } : a)),
          );
        }
      } else {
        // Read text files client-side
        const reader = new FileReader();
        reader.onload = () => {
          setAttachments((prev) =>
            prev.map((a) => (a.id === attId ? { ...a, content: reader.result as string, status: "ready" as const } : a)),
          );
        };
        reader.onerror = () => {
          setAttachments((prev) =>
            prev.map((a) => (a.id === attId ? { ...a, status: "error" as const, error: "Failed to read file" } : a)),
          );
        };
        reader.readAsText(file);
      }
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(processFile);
    }
    // Reset so same file can be selected again
    e.target.value = "";
  };

  // Drag and drop
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    Array.from(files).forEach(processFile);
  };

  // Paste image from clipboard
  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) processFile(file);
        return;
      }
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const att = prev.find((a) => a.id === id);
      if (att?.thumbnailUrl) URL.revokeObjectURL(att.thumbnailUrl);
      return prev.filter((a) => a.id !== id);
    });
  };

  const acceptTypes = supportsVision
    ? ".txt,.md,.csv,.json,.xml,.log,.pdf,.docx,.png,.jpg,.jpeg,.gif,.webp"
    : ".txt,.md,.csv,.json,.xml,.log,.pdf,.docx";

  return (
    <div
      className={`border-t border-zinc-800 p-4 ${isDragOver ? "bg-blue-900/20 border-blue-500" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Attachment chips */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {attachments.map((att) => (
            <AttachmentChip
              key={att.id}
              type={att.type}
              filename={att.path ?? att.filename}
              size={att.size}
              thumbnailUrl={att.thumbnailUrl}
              status={att.status}
              error={att.error}
              onRemove={() => removeAttachment(att.id)}
            />
          ))}
        </div>
      )}

      <div className="relative flex gap-2">
        {/* @ mention popup */}
        <FileMentionPopup
          query={mentionQuery}
          files={projectFiles}
          onSelect={handleMentionSelect}
          onClose={() => setShowMentionPopup(false)}
          visible={showMentionPopup}
        />

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptTypes}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Paperclip button */}
        <button
          onClick={handleFileSelect}
          className="self-end rounded-lg p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          title="Attach file"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          onPaste={handlePaste}
          placeholder="Type a message... (@ to mention files, Shift+Enter for newline)"
          rows={1}
          className="flex-1 resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500"
          disabled={isLoading}
        />
        {isLoading ? (
          <button
            onClick={onStop}
            className="self-end rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-500"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!text.trim() && attachments.length === 0}
            className="self-end rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        )}
      </div>

      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-900/30 border-2 border-dashed border-blue-500 rounded-lg pointer-events-none z-40">
          <span className="text-blue-300 text-lg font-medium">Drop files here</span>
        </div>
      )}
    </div>
  );
}
