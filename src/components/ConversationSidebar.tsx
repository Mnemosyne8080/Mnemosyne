import React from 'react';
import { useAppStore } from '../store';
import { ConversationList } from './ConversationList';
import { PanelLeftClose, PanelLeft } from 'lucide-react';

interface ConversationSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectConversation: (id: string) => void;
}

export function ConversationSidebar({ isOpen, onToggle, onSelectConversation }: ConversationSidebarProps) {
  const user = useAppStore((s) => s.user);
  const currentConversationId = useAppStore((s) => s.currentConversationId);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-40 w-[260px] bg-[var(--color-surface)] border-r-2 border-[var(--color-border)] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:hidden'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3.5 border-b-2 border-[var(--color-border)] flex justify-between items-center shrink-0">
          <h2 className="text-sm font-black uppercase tracking-[0.12em]">Chats</h2>
          <button
            onClick={onToggle}
            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] transition-colors md:hidden"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="px-4 py-2.5 border-b border-[var(--color-border-light)] shrink-0">
            <div className="flex items-center gap-2">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt=""
                  className="w-6 h-6 rounded-full border-2 border-[var(--color-border)]"
                />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-[var(--color-border)] bg-[var(--color-surface-raised)] flex items-center justify-center text-[9px] font-bold uppercase">
                  {(user.email || '?')[0]}
                </div>
              )}
              <span className="font-mono text-[10px] text-[var(--color-text-secondary)] truncate">
                {user.email}
              </span>
            </div>
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-hidden">
          <ConversationList
            onSelect={onSelectConversation}
            currentId={currentConversationId}
          />
        </div>
      </div>

      {/* Toggle button (visible when sidebar is closed on desktop) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="hidden md:flex fixed top-3 left-3 z-20 p-2 border-2 border-[var(--color-border)] bg-[var(--color-surface)] shadow-[2px_2px_0px_0px_var(--color-border)] hover:shadow-[3px_3px_0px_0px_var(--color-border)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
          aria-label="Open sidebar"
        >
          <PanelLeft className="w-4 h-4 text-[var(--color-text-primary)]" />
        </button>
      )}
    </>
  );
}
