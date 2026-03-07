import { useState, useEffect, useCallback, useRef } from "react";
import { useChatStore } from "./stores/chatStore";
import { useExecutionStore } from "./stores/executionStore";
import { usePlanStore, type PlanStep } from "./stores/planStore";
import { useWebSocket } from "./hooks/useWebSocket";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import Chat from "./components/Chat";
import Input from "./components/Input";
import StatusBar from "./components/StatusBar";
import ExecutionProgress from "./components/ExecutionProgress";
import PlanView from "./components/PlanView";
import Settings from "./components/Settings";
import FileTree from "./components/FileTree";
import ShortcutsHelp from "./components/ShortcutsHelp";
import ProjectSwitcher from "./components/ProjectSwitcher";
import ConversationHistory from "./components/ConversationHistory";

export default function App() {
  const addMessage = useChatStore((s) => s.addMessage);
  const setLoading = useChatStore((s) => s.setLoading);
  const clearMessages = useChatStore((s) => s.clearMessages);
  const executionSteps = useExecutionStore((s) => s.steps);
  const resetExecution = useExecutionStore((s) => s.resetExecution);
  const plan = usePlanStore((s) => s.plan);
  const clearPlan = usePlanStore((s) => s.clearPlan);
  const startExecution = useExecutionStore((s) => s.startExecution);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showProjectSwitcher, setShowProjectSwitcher] = useState(false);
  const [providerName, setProviderName] = useState("deepseek");
  const [projectInfo, setProjectInfo] = useState<{ path: string; name: string }>({ path: "", name: "" });
  const [fileTreeKey, setFileTreeKey] = useState(0);
  const [sidebarTab, setSidebarTab] = useState<"files" | "history">("files");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleProjectSwitched = useCallback((event: { path: string; name: string }) => {
    setProjectInfo(event);
    clearMessages();
    clearPlan();
    resetExecution();
    setFileTreeKey((k) => k + 1);
  }, [clearMessages, clearPlan, resetExecution]);

  const { status, sendMessage } = useWebSocket(handleProjectSwitched);

  useEffect(() => {
    fetch("/api/provider/current")
      .then((r) => r.json())
      .then((data: { provider?: string }) => {
        if (data.provider) setProviderName(data.provider);
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

  const handleSend = (message: string) => {
    addMessage("user", message);
    setLoading(true);
    sendMessage("chat", { message });
  };

  const handleExecute = (steps: PlanStep[]) => {
    startExecution(steps.map((s) => ({ id: s.id, description: s.description })));
    const execSteps = steps.map((s) => ({
      id: s.id,
      type: s.type,
      target: s.target,
      content: s.content,
      description: s.description,
    }));
    sendMessage("execute", { steps: execSteps });
    clearPlan();
  };

  const handleReject = () => clearPlan();
  const handleCancel = () => sendMessage("execute:cancel");
  const handleRollback = () => sendMessage("execute:rollback");

  const handleNewChat = useCallback(() => {
    clearMessages();
    clearPlan();
    resetExecution();
  }, [clearMessages, clearPlan, resetExecution]);

  const handleFileClick = (filePath: string) => {
    handleSend(`I'm looking at \`${filePath}\`. Please read this file.`);
  };

  useKeyboardShortcuts({
    onNewChat: handleNewChat,
    onFocusInput: () => inputRef.current?.focus(),
    onToggleSidebar: () => setShowSidebar((v) => !v),
    onEscape: () => {
      if (showProjectSwitcher) setShowProjectSwitcher(false);
      else if (showSettings) setShowSettings(false);
      else if (showShortcuts) setShowShortcuts(false);
      else if (plan) clearPlan();
    },
    onShowHelp: () => setShowShortcuts((v) => !v),
    onOpenProject: () => setShowProjectSwitcher((v) => !v),
  });

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
      <StatusBar
        status={status}
        providerName={providerName}
        projectName={projectInfo.name}
        sidebarOpen={showSidebar}
        onToggleSidebar={() => setShowSidebar((v) => !v)}
        onSettingsClick={() => setShowSettings(true)}
        onProjectClick={() => setShowProjectSwitcher(true)}
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
        <div className="flex flex-1 flex-col overflow-hidden">
          <Chat />
          {plan && (
            <PlanView onExecute={handleExecute} onReject={handleReject} />
          )}
          {executionSteps.length > 0 && !plan && (
            <ExecutionProgress onCancel={handleCancel} onRollback={handleRollback} />
          )}
          <Input onSend={handleSend} inputRef={inputRef} />
        </div>
      </div>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
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
