interface AttachmentChipProps {
  type: "file_mention" | "document" | "image";
  filename: string;
  size?: number;
  thumbnailUrl?: string;
  status?: "uploading" | "ready" | "error";
  error?: string;
  onRemove: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function AttachmentChip({
  type,
  filename,
  size,
  thumbnailUrl,
  status = "ready",
  error,
  onRemove,
}: AttachmentChipProps) {
  const icon = type === "file_mention" ? "@" : type === "image" ? "\uD83D\uDDBC" : "\uD83D\uDCC4";

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ${
        error
          ? "bg-red-900/40 border border-red-700 text-red-300"
          : "bg-zinc-800 border border-zinc-700 text-zinc-300"
      }`}
      title={error || filename}
    >
      {type === "image" && thumbnailUrl ? (
        <img src={thumbnailUrl} alt="" className="w-6 h-6 rounded object-cover" />
      ) : (
        <span>{icon}</span>
      )}
      <span className="max-w-[150px] truncate">{filename}</span>
      {size != null && <span className="text-zinc-500">{formatSize(size)}</span>}
      {status === "uploading" && (
        <span className="w-3 h-3 border-2 border-zinc-500 border-t-blue-400 rounded-full animate-spin" />
      )}
      <button
        onClick={onRemove}
        className="text-zinc-500 hover:text-zinc-200 ml-0.5"
        title="Remove"
      >
        ×
      </button>
    </div>
  );
}
