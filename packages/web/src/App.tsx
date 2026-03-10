import { useState, useEffect, useCallback, useRef } from "react";
import { useChatStore } from "./stores/chatStore";
import type { MessageAttachment } from "./stores/chatStore";
import { useWebSocket } from "./hooks/useWebSocket";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import Chat from "./components/Chat";
import Input from "./components/Input";
import StatusBar from "./components/StatusBar";
import Settings from "./components/Settings";
import FileTree from "./components/FileTree";
import ShortcutsHelp from "./components/ShortcutsHelp";
import ProjectSwitcher from "./components/ProjectSwitcher";
import ConversationHistory from "./components/ConversationHistory";
import CodeView from "./components/CodeView";
import BugReport from "./components/BugReport";

export default function App() {
  const addMessage = useChatStore((s) => s.addMessage);
  const setLoading = useChatStore((s) => s.setLoading);
  const clearMessages = useChatStore((s) => s.clearMessages);
  const deleteMessageAndAfter = useChatStore((s) => s.deleteMessageAndAfter);
  const regenerateFrom = useChatStore((s) => s.regenerateFrom);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showProjectSwitcher, setShowProjectSwitcher] = useState(false);
  const [showBugReport, setShowBugReport] = useState(false);
  const [providerName, setProviderName] = useState("deepseek");
  const [currentModel, setCurrentModel] = useState<string | undefined>();
  const [supportsVision, setSupportsVision] = useState(false);
  const [projectInfo, setProjectInfo] = useState<{ path: string; name: string }>({ path: "", name: "" });
  const [fileTreeKey, setFileTreeKey] = useState(0);
  const [sidebarTab, setSidebarTab] = useState<"files" | "history">("files");
  const [openFile, setOpenFile] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleProjectSwitched = useCallback((event: { path: string; name: string }) => {
    setProjectInfo(event);
    clearMessages();
    setOpenFile(null);
    setFileTreeKey((k) => k + 1);
  }, [clearMessages]);

  const { status, sendMessage } = useWebSocket(handleProjectSwitched);

  useEffect(() => {
    fetch("/api/provider/current")
      .then((r) => r.json())
      .then((data: { provider?: string; model?: string; supportsVision?: boolean }) => {
        if (data.provider) setProviderName(data.provider);
        if (data.model) setCurrentModel(data.model);
        setSupportsVision(data.supportsVision ?? false);
      })
      .catch(() => {});
  }, [showSettings]);

  useEffect(() => {
    fetch("/api/project/current")
      .then((r) => r.json())
      .then((data: { path?: string; name?: string }) => {
        if (data.path && data.name) setProjectInfo({ path: data.path, name: data.name });
      })
      .catch(() => {});
  }, []);

  const handleSend = (message: string, attachments?: MessageAttachment[]) => {
    addMessage("user", message, attachments);
    setLoading(true);
    sendMessage("chat", {
      message,
      attachments: attachments?.map((a) => ({
        type: a.type,
        path: a.path,
        filename: a.filename,
        content: a.content,
        mimeType: a.mimeType,
        data: a.data,
      })),
    });
  };

  const handleStop = useCallback(() => {
    sendMessage("chat:cancel");
  }, [sendMessage]);

  const handleDelete = useCallback((messageId: string) => {
    const idx = deleteMessageAndAfter(messageId);
    if (idx >= 0) {
      sendMessage("chat:delete", { messageIndex: idx });
    }
  }, [deleteMessageAndAfter, sendMessage]);

  const handleRegenerate = useCallback((assistantMsgId: string) => {
    const result = regenerateFrom(assistantMsgId);
    if (!result) return;
    // Re-add the user message and send it as a new chat
    addMessage("user", result.userMessage);
    setLoading(true);
    // Tell server to delete from that index and regenerate
    sendMessage("chat:delete", { messageIndex: result.deleteIndex });
    sendMessage("chat", { message: result.userMessage });
  }, [regenerateFrom, addMessage, setLoading, sendMessage]);

  const handleModelChange = useCallback((model: string) => {
    fetch("/api/provider/model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model }),
    })
      .then((r) => r.json())
      .then((data: { success?: boolean; model?: string; supportsVision?: boolean }) => {
        if (data.success && data.model) {
          setCurrentModel(data.model);
          setSupportsVision(data.supportsVision ?? false);
        }
      })
      .catch(() => {});
  }, []);

  const handleNewChat = useCallback(() => {
    clearMessages();
  }, [clearMessages]);

  const handleFileClick = (filePath: string) => {
    setOpenFile(filePath);
  };

  const handleFileMention = (filePath: string) => {
    setOpenFile(null);
    inputRef.current?.focus();
    // Dispatch a custom event so Input can pick up the mention
    window.dispatchEvent(new CustomEvent("file:mention", { detail: filePath }));
  };

  useKeyboardShortcuts({
    onNewChat: handleNewChat,
    onFocusInput: () => inputRef.current?.focus(),
    onToggleSidebar: () => setShowSidebar((v) => !v),
    onEscape: () => {
      if (showProjectSwitcher) setShowProjectSwitcher(false);
      else if (showSettings) setShowSettings(false);
      else if (showShortcuts) setShowShortcuts(false);
      else if (openFile) setOpenFile(null);
    },
    onShowHelp: () => setShowShortcuts((v) => !v),
    onOpenProject: () => setShowProjectSwitcher((v) => !v),
  });

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
      <StatusBar
        status={status}
        providerName={providerName}
        currentModel={currentModel}
        projectName={projectInfo.name}
        sidebarOpen={showSidebar}
        onToggleSidebar={() => setShowSidebar((v) => !v)}
        onSettingsClick={() => setShowSettings(true)}
        onBugReportClick={() => setShowBugReport(true)}
        onProjectClick={() => setShowProjectSwitcher(true)}
        onModelChange={handleModelChange}
      />
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && (
          <div className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col shrink-0">
            <div className="flex items-center justify-between border-b border-zinc-800">
              <div className="flex">
                <button
                  onClick={() => setSidebarTab("files")}
                  className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    sidebarTab === "files" ? "text-zinc-200 border-b-2 border-blue-500" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Files
                </button>
                <button
                  onClick={() => setSidebarTab("history")}
                  className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    sidebarTab === "history" ? "text-zinc-200 border-b-2 border-blue-500" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  History
                </button>
              </div>
              <button onClick={() => setShowSidebar(false)} className="text-zinc-500 hover:text-zinc-300 text-xs px-3">
                x
              </button>
            </div>
            {sidebarTab === "files" && (
              <FileTree
                key={fileTreeKey}
                visible={true}
                onToggle={() => setShowSidebar(false)}
                onFileClick={handleFileClick}
                embedded
              />
            )}
            {sidebarTab === "history" && (
              <ConversationHistory onNewChat={handleNewChat} />
            )}
          </div>
        )}
        <div className={`flex flex-1 overflow-hidden ${openFile ? "flex-row" : "flex-col"}`}>
          {openFile ? (
            <>
              <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                <Chat onDelete={handleDelete} onRegenerate={handleRegenerate} />
                <Input onSend={handleSend} onStop={handleStop} inputRef={inputRef} supportsVision={supportsVision} />
              </div>
              <div className="w-1/2 max-w-[50%] shrink-0">
                <CodeView
                  filePath={openFile}
                  onClose={() => setOpenFile(null)}
                  onMention={handleFileMention}
                />
              </div>
            </>
          ) : (
            <>
              <Chat onDelete={handleDelete} onRegenerate={handleRegenerate} />
              <Input onSend={handleSend} onStop={handleStop} inputRef={inputRef} supportsVision={supportsVision} />
            </>
          )}
        </div>
      </div>
      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          onProviderSwitch={(provider, model) => {
            setProviderName(provider);
            if (model) setCurrentModel(model);
          }}
        />
      )}
      {showBugReport && <BugReport onClose={() => setShowBugReport(false)} />}
      {showShortcuts && <ShortcutsHelp onClose={() => setShowShortcuts(false)} />}
      {showProjectSwitcher && (
        <ProjectSwitcher
          currentProject={projectInfo}
          onClose={() => setShowProjectSwitcher(false)}
          onSwitched={handleProjectSwitched}
        />
      )}
    </div>
  );
}
