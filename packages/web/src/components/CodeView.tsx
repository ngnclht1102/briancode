import { useState, useEffect, useRef } from "react";
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

interface CodeViewProps {
  filePath: string;
  onClose: () => void;
  onMention: (filePath: string) => void;
}

const LANG_MAP: Record<string, string> = {
  ts: "typescript", tsx: "tsx", js: "javascript", jsx: "jsx",
  py: "python", rs: "rust", go: "go", java: "java", rb: "ruby",
  css: "css", html: "html", json: "json", md: "markdown", yaml: "yaml",
  yml: "yaml", toml: "toml", sh: "shellscript", bash: "shellscript",
  sql: "sql", xml: "xml", svg: "xml",
  c: "c", cpp: "cpp", h: "c", hpp: "cpp",
};

// Maps lang id → dynamic import for the grammar
const LANG_IMPORTS: Record<string, () => Promise<unknown>> = {
  typescript: () => import("shiki/langs/typescript.mjs"),
  tsx: () => import("shiki/langs/tsx.mjs"),
  javascript: () => import("shiki/langs/javascript.mjs"),
  jsx: () => import("shiki/langs/jsx.mjs"),
  python: () => import("shiki/langs/python.mjs"),
  rust: () => import("shiki/langs/rust.mjs"),
  go: () => import("shiki/langs/go.mjs"),
  java: () => import("shiki/langs/java.mjs"),
  ruby: () => import("shiki/langs/ruby.mjs"),
  css: () => import("shiki/langs/css.mjs"),
  html: () => import("shiki/langs/html.mjs"),
  json: () => import("shiki/langs/json.mjs"),
  markdown: () => import("shiki/langs/markdown.mjs"),
  yaml: () => import("shiki/langs/yaml.mjs"),
  toml: () => import("shiki/langs/toml.mjs"),
  shellscript: () => import("shiki/langs/shellscript.mjs"),
  sql: () => import("shiki/langs/sql.mjs"),
  xml: () => import("shiki/langs/xml.mjs"),
  c: () => import("shiki/langs/c.mjs"),
  cpp: () => import("shiki/langs/cpp.mjs"),
};

function getLang(filePath: string): string {
  const name = filePath.split("/").pop()?.toLowerCase() ?? "";
  if (name === "dockerfile") return "dockerfile";
  if (name === "makefile") return "makefile";
  const ext = name.split(".").pop() ?? "";
  return LANG_MAP[ext] ?? "plaintext";
}

function getLangLabel(filePath: string): string {
  const lang = getLang(filePath);
  return lang === "shellscript" ? "shell" : lang;
}

// Singleton core highlighter — loads theme once, langs on-demand
let corePromise: Promise<HighlighterCore> | null = null;
const loadedLangs = new Set<string>();

async function getHL(): Promise<HighlighterCore> {
  if (!corePromise) {
    corePromise = createHighlighterCore({
      themes: [import("shiki/themes/github-dark-default.mjs")],
      langs: [],
      engine: createJavaScriptRegexEngine(),
    });
  }
  return corePromise;
}

async function ensureLang(hl: HighlighterCore, lang: string) {
  if (lang === "plaintext" || loadedLangs.has(lang)) return;
  const loader = LANG_IMPORTS[lang];
  if (!loader) return;
  await hl.loadLanguage(await loader() as never);
  loadedLangs.add(lang);
}

export default function CodeView({ filePath, onClose, onMention }: CodeViewProps) {
  const [content, setContent] = useState<string | null>(null);
  const [highlighted, setHighlighted] = useState<string[][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<string | null>(null);

  // Fetch file content
  useEffect(() => {
    setLoading(true);
    setError(null);
    setContent(null);
    setHighlighted(null);
    contentRef.current = null;

    fetch(`/api/file/${encodeURIComponent(filePath)}`)
      .then((r) => r.json())
      .then((data: { content?: string; error?: string }) => {
        if (data.error) {
          setError(data.error);
        } else {
          const text = data.content ?? "";
          contentRef.current = text;
          setContent(text);
        }
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [filePath]);

  // Highlight with Shiki once content is loaded
  useEffect(() => {
    if (content === null) return;
    let cancelled = false;
    const lang = getLang(filePath);

    (async () => {
      try {
        const hl = await getHL();
        await ensureLang(hl, lang);
        if (cancelled || contentRef.current !== content) return;

        const resolvedLang = loadedLangs.has(lang) ? lang : "plaintext";
        const tokens = hl.codeToTokensBase(content, {
          lang: resolvedLang as never,
          theme: "github-dark-default",
        });

        const lines: string[][] = tokens.map((line) =>
          line.map((token) => {
            const escaped = token.content
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;");
            return token.color
              ? `<span style="color:${token.color}">${escaped}</span>`
              : escaped;
          }),
        );

        if (!cancelled) setHighlighted(lines);
      } catch {
        // Shiki failed — plain text fallback (content is already displayed)
      }
    })();

    return () => { cancelled = true; };
  }, [content, filePath]);

  const lines = content?.split("\n") ?? [];
  const lineNumWidth = String(lines.length).length;
  const lang = getLangLabel(filePath);
  const fileName = filePath.split("/").pop() ?? filePath;

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-l border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-zinc-500 uppercase">{lang}</span>
          <span className="text-sm text-zinc-300 truncate" title={filePath}>
            {fileName}
          </span>
          <span className="text-xs text-zinc-600 truncate hidden sm:inline" title={filePath}>
            {filePath}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onMention(filePath)}
            className="px-2 py-1 text-xs rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            title="Add as @ mention in chat"
          >
            @ Mention
          </button>
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto font-mono text-xs">
        {loading && (
          <div className="flex items-center justify-center h-full text-zinc-500">
            Loading...
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-full text-red-400 px-4 text-center">
            {error}
          </div>
        )}
        {content !== null && (
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="hover:bg-zinc-900/50">
                  <td
                    className="text-right text-zinc-600 select-none px-3 py-0 leading-5 border-r border-zinc-800 sticky left-0 bg-zinc-950"
                    style={{ minWidth: `${lineNumWidth + 2}ch` }}
                  >
                    {i + 1}
                  </td>
                  <td className="px-3 py-0 leading-5 whitespace-pre">
                    {highlighted ? (
                      <span dangerouslySetInnerHTML={{ __html: highlighted[i]?.join("") ?? "" }} />
                    ) : (
                      <span className="text-zinc-300">{line || " "}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {content !== null && (
        <div className="flex items-center justify-between px-3 py-1 border-t border-zinc-800 text-xs text-zinc-600 shrink-0">
          <span>{lines.length} lines</span>
          <span>{filePath}</span>
        </div>
      )}
    </div>
  );
}
