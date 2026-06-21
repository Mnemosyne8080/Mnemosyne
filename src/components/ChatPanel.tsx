import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../store';
import { Settings as SettingsIcon, Send, Terminal, Sparkles, Zap, LogOut, Copy, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { addMessage as saveMessageToDb } from '../lib/supabase/services';
import { PromptSuggestions } from './PromptSuggestions';

interface ChatPanelProps {
  openSettings: () => void;
  onNewChat: () => void;
  onOpenWorkflows: () => void;
  onLogout: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function ChatPanel({ openSettings, onNewChat, onOpenWorkflows, onLogout, inputRef }: ChatPanelProps) {
  const {
    messages, addMessage, baseUrl, modelName, apiKey, isProcessing,
    setProcessing, clearChat, updatePlan, plan, triggerExport,
    currentConversationId, user,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [reasoning, setReasoning] = useState<{ agent: string; status: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const actualInputRef = inputRef || internalInputRef;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, reasoning]);

  const persistMessage = useCallback(
    async (msg: { id: string; role: 'user' | 'assistant'; content: string; agent?: string; options?: string[] }) => {
      if (currentConversationId && user) {
        try {
          await saveMessageToDb({
            conversationId: currentConversationId,
            role: msg.role,
            content: msg.content,
            agent: msg.agent,
            options: msg.options || null,
          });
        } catch (err) {
          console.error('Failed to save message:', err);
        }
      }
    },
    [currentConversationId, user]
  );

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    const finalInput = overrideInput !== undefined ? overrideInput : input.trim();
    if (!finalInput || isProcessing) return;

    if (!apiKey) {
      alert('Please configure your API key in settings first.');
      openSettings();
      return;
    }

    const userMsg = { id: uuidv4(), role: 'user' as const, content: finalInput, timestamp: Date.now() };
    addMessage(userMsg);
    persistMessage(userMsg);
    setInput('');
    setProcessing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          messages: [...messages, userMsg],
          baseUrl,
          model: modelName,
          apiKey,
          currentPlan: plan,
        }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() || '';

        for (const chunk of chunks) {
          if (!chunk.startsWith('event: ')) continue;
          const lines = chunk.split('\n');
          const eventType = lines[0].replace('event: ', '');
          const dataStr = lines[1]?.replace('data: ', '');
          if (!dataStr) continue;
          let data;
          try {
            data = JSON.parse(dataStr);
          } catch {
            continue;
          }

          if (eventType === 'reasoning') {
            setReasoning({ agent: data.agent, status: data.status });
          } else if (eventType === 'text') {
            const assistantMsg = {
              id: uuidv4(),
              role: 'assistant' as const,
              content: data.text,
              agent: data.agent,
              timestamp: Date.now(),
              options: data.options,
            };
            addMessage(assistantMsg);
            persistMessage(assistantMsg);
            setReasoning(null);
          } else if (eventType === 'plan_update') {
            updatePlan(data);
          } else if (eventType === 'done') {
            setReasoning(null);
          } else if (eventType === 'export_pdf') {
            triggerExport();
          } else if (eventType === 'error') {
            const errorMsg = {
              id: uuidv4(),
              role: 'assistant' as const,
              content: `Error: ${data.message}`,
              agent: 'System',
              timestamp: Date.now(),
            };
            addMessage(errorMsg);
            persistMessage(errorMsg);
            setReasoning(null);
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg = {
        id: uuidv4(),
        role: 'assistant' as const,
        content: `Failed to connect or process: ${err.message}`,
        agent: 'System',
        timestamp: Date.now(),
      };
      addMessage(errorMsg);
      persistMessage(errorMsg);
      setReasoning(null);
    } finally {
      setProcessing(false);
      actualInputRef.current?.focus();
    }
  };

  const handleSuggestionSelect = (text: string) => {
    setInput(text);
    // Auto-submit after a tick to let the input update
    setTimeout(() => {
      handleSubmit(undefined, text);
    }, 50);
  };

  const handleCopyMessage = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // silently fail
    }
  };

  const agentColors: Record<string, string> = {
    Router: 'bg-[#1a1917] text-[#faf9f6]',
    Clarifier: 'bg-[#c4553a] text-white',
    Researcher: 'bg-[#3a7d44] text-white',
    Planner: 'bg-[#1a1917] text-[#faf9f6]',
    Helper: 'bg-[#5c5955] text-white',
    System: 'bg-[#8a8680] text-white',
  };

  return (
    <div className="h-full flex flex-col bg-[var(--color-base)]">
      {/* Header */}
      <div className="px-5 py-3.5 border-b-2 border-[var(--color-border)] flex justify-between items-center shrink-0 bg-[var(--color-surface)]">
        <div className="w-8 md:hidden" />
        <h1 className="text-lg font-black uppercase tracking-[0.12em] flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[var(--color-border)] text-[var(--color-base)] flex items-center justify-center -rotate-3 text-xs">
            Mn
          </div>
          <span>Mnemosyne</span>
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenWorkflows}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] transition-colors"
            aria-label="Workflows"
            title="Workflows"
          >
            <Zap className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={onNewChat}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] transition-colors"
            aria-label="New chat"
            title="New chat"
          >
            <Terminal className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={openSettings}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] transition-colors relative"
            aria-label="Settings"
            title="Settings"
          >
            <SettingsIcon className="w-[18px] h-[18px]" />
            {!apiKey && (
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-error)] rounded-full ring-2 ring-[var(--color-surface)]" />
            )}
          </button>
          <button
            onClick={onLogout}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] transition-colors"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
        {messages.length === 0 && !isProcessing && (
          <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="w-14 h-14 border-2 border-[var(--color-border)] flex items-center justify-center mb-6 rotate-3">
              <Sparkles className="w-6 h-6 text-[var(--color-text-muted)]" />
            </div>
            <h2 className="text-lg font-bold uppercase tracking-[0.14em] mb-3 text-[var(--color-text-primary)]">
              Start the process
            </h2>
            <p className="font-mono text-sm max-w-xs mb-8 text-[var(--color-text-secondary)] leading-relaxed">
              Describe your idea, project, or goal. The multi-agent system will break it down, validate assumptions, and build an execution plan.
            </p>
            {!apiKey && (
              <div className="panel-brutal-static p-4 flex items-center gap-3 max-w-xs">
                <SettingsIcon className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" />
                <div className="text-left font-mono text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
                  Requires your own API key.
                  <br />
                  Configure in <strong>Settings → API Key</strong>
                </div>
              </div>
            )}
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}
            style={{ animationDelay: `${idx * 30}ms` }}
          >
            <div className="flex items-end gap-2.5 max-w-[88%]">
              {msg.role === 'assistant' && (
                <div
                  className={`w-7 h-7 shrink-0 border-2 border-[var(--color-border)] flex items-center justify-center text-[9px] font-bold uppercase overflow-hidden ${
                    agentColors[msg.agent || ''] || 'bg-[#1a1917] text-[#faf9f6]'
                  }`}
                >
                  {msg.agent?.substring(0, 2) || 'Mn'}
                </div>
              )}
              <div
                className={`relative border-2 border-[var(--color-border)] ${
                  msg.role === 'user'
                    ? 'bg-[var(--color-border)] text-[var(--color-base)]'
                    : 'bg-[var(--color-surface)] shadow-[3px_3px_0px_0px_rgba(26,25,23,0.12)]'
                } transition-colors duration-150 ${
                  msg.role === 'assistant' ? 'hover:bg-[var(--color-surface-hover)] cursor-pointer group' : ''
                }`}
                onClick={() => msg.role === 'assistant' && handleCopyMessage(msg.id, msg.content)}
              >
                <div
                  className={`px-3.5 pt-2.5 pb-0 text-[10px] font-bold uppercase tracking-[0.12em] ${
                    msg.role === 'user' ? 'text-white/50' : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  {msg.role === 'user' ? 'You' : msg.agent}
                </div>
                <div className="px-3.5 py-2.5 font-mono text-[13px] whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>

                {/* Copy indicator */}
                {msg.role === 'assistant' && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-[#3a7d44]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                    )}
                  </div>
                )}

                {copiedId === msg.id && (
                  <div className="absolute -top-8 right-0 bg-[var(--color-border)] text-[var(--color-base)] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em]">
                    Copied!
                  </div>
                )}

                {msg.options && msg.options.length > 0 && (
                  <div className="px-3.5 pb-3.5 flex flex-col gap-1.5">
                    {msg.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubmit(undefined, opt);
                        }}
                        disabled={isProcessing}
                        className="text-left font-mono text-xs px-3 py-2.5 border-2 border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-border)] hover:text-[var(--color-base)] transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {reasoning && (
          <div className="flex items-end gap-2.5 max-w-[80%] animate-fade-in">
            <div className="w-7 h-7 shrink-0 border-2 border-[var(--color-border)] bg-[var(--color-surface-raised)] flex items-center justify-center">
              <div className="flex gap-0.5">
                <span
                  className="w-1 h-1 bg-[var(--color-text-muted)] rounded-full animate-pulse-dot"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="w-1 h-1 bg-[var(--color-text-muted)] rounded-full animate-pulse-dot"
                  style={{ animationDelay: '200ms' }}
                />
                <span
                  className="w-1 h-1 bg-[var(--color-text-muted)] rounded-full animate-pulse-dot"
                  style={{ animationDelay: '400ms' }}
                />
              </div>
            </div>
            <div className="border-2 border-dashed border-[var(--color-border-light)] bg-[var(--color-surface-raised)] px-3.5 py-2.5">
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-1">
                {reasoning.agent}
              </div>
              <div className="font-mono text-xs text-[var(--color-text-secondary)]">
                {reasoning.status}
              </div>
            </div>
          </div>
        )}

        {/* Skeleton loading when processing but no reasoning yet */}
        {isProcessing && !reasoning && (
          <div className="flex items-end gap-2.5 max-w-[80%] animate-fade-in">
            <div className="w-7 h-7 shrink-0 border-2 border-[var(--color-border)] bg-[var(--color-surface-raised)] flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-[var(--color-text-muted)] border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] shadow-[3px_3px_0px_0px_rgba(26,25,23,0.12)] px-4 py-3 space-y-2">
              <div className="skeleton h-3 w-48 rounded" />
              <div className="skeleton h-3 w-36 rounded" />
              <div className="skeleton h-3 w-44 rounded" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Prompt Suggestions */}
      {!isProcessing && <PromptSuggestions onSelect={handleSuggestionSelect} />}

      {/* Input area */}
      <div className="px-4 py-3 border-t-2 border-[var(--color-border)] bg-[var(--color-surface)] shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-3 items-center">
          <input
            ref={actualInputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your idea or next step..."
            className="input-brutal flex-1 w-full py-3"
            disabled={isProcessing}
            autoFocus
          />
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="btn-brutal-dark px-4 py-3 shrink-0 disabled:opacity-30 hover:scale-105 active:scale-100 transition-transform duration-100"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
