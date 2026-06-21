import React, { useState, useEffect, useRef } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { PlanPanel } from './components/PlanPanel';
import { SettingsModal } from './components/SettingsModal';
import { AuthScreen } from './components/AuthScreen';
import { ConversationSidebar } from './components/ConversationSidebar';
import { WorkflowPanel } from './components/WorkflowPanel';
import { WorkflowCreator } from './components/WorkflowCreator';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { MapPin, MessageSquare, LogOut } from 'lucide-react';
import { useAppStore } from './store';

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [showPlanMobile, setShowPlanMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWorkflows, setShowWorkflows] = useState(false);
  const [showWorkflowCreator, setShowWorkflowCreator] = useState(false);

  const { user, isAuthenticated, setUser, logout, clearChat, createNewConversation, loadConversation, setCurrentConversationId } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Check session on mount
  useEffect(() => {
    if (!user) {
      fetch('/api/auth/session', { credentials: 'include' })
        .then((r) => r.json())
        .then((data) => {
          if (data.user) setUser(data.user);
        })
        .catch(() => {});
    }
  }, [user, setUser]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewChat: () => handleNewChat(),
    onFocusInput: () => inputRef.current?.focus(),
    onToggleSettings: () => setShowSettings((v) => !v),
    onEscape: () => {
      setShowSettings(false);
      setShowWorkflows(false);
      setShowWorkflowCreator(false);
      setSidebarOpen(false);
    },
  });

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    logout();
  };

  const handleNewChat = async () => {
    if (user) {
      const id = await createNewConversation();
      if (id) setCurrentConversationId(id);
    } else {
      clearChat();
    }
  };

  const handleSelectConversation = async (id: string) => {
    setCurrentConversationId(id);
    await loadConversation(id);
    setSidebarOpen(false);
  };

  if (!isAuthenticated || !user) {
    return <AuthScreen />;
  }

  return (
    <div className="h-screen w-full bg-[var(--color-base)] flex overflow-hidden font-sans">
      {/* Sidebar */}
      <ConversationSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onSelectConversation={handleSelectConversation}
      />

      {/* Chat Panel */}
      <div
        className={`h-full transition-all duration-300 ease-in-out ${
          showPlanMobile
            ? '-translate-x-full absolute opacity-0 pointer-events-none'
            : 'translate-x-0 relative'
        } flex-1 min-w-0`}
      >
        <ChatPanel
          openSettings={() => setShowSettings(true)}
          onNewChat={handleNewChat}
          onOpenWorkflows={() => setShowWorkflows(true)}
          onLogout={handleLogout}
          inputRef={inputRef}
        />
      </div>

      {/* Plan Panel */}
      <div
        className={`w-full md:w-[42%] h-full shrink-0 transition-all duration-300 ease-in-out ${
          showPlanMobile
            ? 'translate-x-0 relative opacity-100'
            : 'translate-x-full absolute md:static md:translate-x-0 opacity-100 md:opacity-100'
        }`}
      >
        <PlanPanel />
      </div>

      {/* Mobile Plan Toggle Button */}
      <button
        className="md:hidden fixed bottom-6 right-5 z-40 w-14 h-14 border-2 border-[var(--color-border)] bg-[var(--color-surface)] shadow-[3px_3px_0px_0px_var(--color-border)] flex items-center justify-center p-0 transition-all duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_var(--color-border)]"
        onClick={() => setShowPlanMobile(!showPlanMobile)}
        aria-label={showPlanMobile ? 'Back to chat' : 'Show plan'}
      >
        {showPlanMobile ? (
          <MessageSquare className="w-5 h-5 text-[var(--color-text-primary)]" />
        ) : (
          <MapPin className="w-5 h-5 text-[var(--color-text-primary)]" />
        )}
      </button>

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {/* Workflow Panel */}
      {showWorkflows && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowWorkflows(false)} />
          <WorkflowPanel
            onClose={() => setShowWorkflows(false)}
            onCreateWorkflow={() => {
              setShowWorkflows(false);
              setShowWorkflowCreator(true);
            }}
          />
        </>
      )}

      {/* Workflow Creator */}
      {showWorkflowCreator && (
        <WorkflowCreator onClose={() => setShowWorkflowCreator(false)} />
      )}
    </div>
  );
}
