import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { getConversations, deleteConversation, updateConversation, createConversation } from '../lib/supabase/services';
import { Plus, Trash2, MessageSquare, ChevronRight } from 'lucide-react';

interface ConversationListProps {
  onSelect: (id: string) => void;
  currentId: string | null;
}

export function ConversationList({ onSelect, currentId }: ConversationListProps) {
  const { user, conversations, setConversations, setCurrentConversationId } = useAppStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  async function loadConversations() {
    if (!user) return;
    try {
      const convs = await getConversations(user.id);
      setConversations(convs);
    } catch {
      // silently fail
    }
  }

  async function handleNewChat() {
    if (!user) return;
    try {
      const conv = await createConversation(user.id);
      setConversations([conv, ...conversations]);
      setCurrentConversationId(conv.id);
      onSelect(conv.id);
    } catch {
      // silently fail
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;
    try {
      await deleteConversation(id);
      setConversations(conversations.filter((c) => c.id !== id));
      if (currentId === id) {
        setCurrentConversationId(null);
      }
    } catch {
      // silently fail
    }
  }

  function startEditing(e: React.MouseEvent, id: string, title: string) {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(title);
  }

  async function saveEdit(id: string) {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await updateConversation(id, { title: editTitle.trim() });
      setConversations(
        conversations.map((c) => (c.id === id ? { ...c, title: editTitle.trim() } : c))
      );
    } catch {
      // silently fail
    }
    setEditingId(null);
  }

  function relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  function groupConversations() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const weekAgo = new Date(today.getTime() - 7 * 86400000);

    const groups: { label: string; items: typeof conversations }[] = [
      { label: 'Today', items: [] },
      { label: 'Yesterday', items: [] },
      { label: 'Last 7 Days', items: [] },
      { label: 'Older', items: [] },
    ];

    for (const c of conversations) {
      const d = new Date(c.updated_at);
      if (d >= today) groups[0].items.push(c);
      else if (d >= yesterday) groups[1].items.push(c);
      else if (d >= weekAgo) groups[2].items.push(c);
      else groups[3].items.push(c);
    }

    return groups.filter((g) => g.items.length > 0);
  }

  const groups = groupConversations();

  return (
    <div className="flex flex-col h-full">
      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={handleNewChat}
          className="btn-brutal w-full flex items-center justify-center gap-2 py-2.5 text-[11px]"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-3">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)] px-2 py-1.5">
              {group.label}
            </div>
            {group.items.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  setCurrentConversationId(conv.id);
                  onSelect(conv.id);
                }}
                className={`group flex items-center gap-2 px-2 py-2 cursor-pointer transition-colors duration-100 ${
                  currentId === conv.id
                    ? 'bg-[var(--color-border)] text-[var(--color-base)]'
                    : 'hover:bg-[var(--color-surface-raised)]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
                <div className="flex-1 min-w-0">
                  {editingId === conv.id ? (
                    <input
                      ref={inputRef}
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => saveEdit(conv.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(conv.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="w-full bg-transparent border-b border-current font-mono text-xs outline-none"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div
                      className="font-mono text-xs truncate"
                      onDoubleClick={(e) => startEditing(e, conv.id, conv.title)}
                    >
                      {conv.title}
                    </div>
                  )}
                  <div
                    className={`font-mono text-[9px] mt-0.5 ${
                      currentId === conv.id ? 'text-white/50' : 'text-[var(--color-text-muted)]'
                    }`}
                  >
                    {relativeTime(conv.updated_at)}
                    {conv.parent_id && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5">
                        <ChevronRight className="w-2.5 h-2.5" />
                        thread
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, conv.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-[var(--color-error)] transition-all shrink-0"
                  aria-label="Delete conversation"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ))}

        {conversations.length === 0 && (
          <div className="text-center py-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              No conversations yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
