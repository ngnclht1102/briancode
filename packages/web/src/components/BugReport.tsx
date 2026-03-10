import { useState } from "react";
import { useChatStore } from "../stores/chatStore";

export default function BugReport({ onClose }: { onClose: () => void }) {
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const messages = useChatStore((s) => s.messages);

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setSending(true);
    setResult(null);

    try {
      const res = await fetch("/api/bug-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() }),
      });
      const data = (await res.json()) as { success?: boolean; filename?: string; error?: string };
      if (data.success) {
        setResult({ success: true, message: `Report saved: ${data.filename}` });
        setDescription("");
      } else {
        setResult({ success: false, message: data.error ?? "Failed to submit" });
      }
    } catch {
      setResult({ success: false, message: "Failed to connect" });
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-zinc-900 rounded-lg border border-zinc-700 p-6 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-100">Report a Problem</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 text-xl">x</button>
        </div>

        <div className="mb-3 text-xs text-zinc-500">
          This will include the current conversation ({messages.length} messages) along with your description.
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the problem..."
          rows={5}
          className="w-full rounded bg-zinc-800 border border-zinc-600 px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 outline-none focus:border-zinc-500 resize-none"
          autoFocus
        />

        {result && (
          <div className={`mt-2 text-xs ${result.success ? "text-green-400" : "text-red-400"}`}>
            {result.message}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={sending || !description.trim()}
            className="px-3 py-1.5 text-xs rounded bg-red-700 hover:bg-red-600 text-white disabled:opacity-40"
          >
            {sending ? "Sending..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
