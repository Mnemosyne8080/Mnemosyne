import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { getStarterSuggestions, getContextualSuggestions } from '../lib/suggestions';

interface PromptSuggestionsProps {
  onSelect: (text: string) => void;
}

export function PromptSuggestions({ onSelect }: PromptSuggestionsProps) {
  const messages = useAppStore((s) => s.messages);
  const plan = useAppStore((s) => s.plan);

  const suggestions =
    messages.length === 0
      ? getStarterSuggestions()
      : getContextualSuggestions(messages, plan);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollLeft = 0;
  }, [suggestions]);

  const handleKey = (e: React.KeyboardEvent<HTMLButtonElement>, text: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(text);
    }
  };

  return (
    <div className="px-4 pt-2 animate-fade-in">
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-2">
        Suggestions
      </div>
      <div
        ref={containerRef}
        className="relative flex gap-2 overflow-x-auto pb-1 hide-scrollbar"
        style={{
          maskImage:
            'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
        }}
      >
        {suggestions.map((s, i) => (
          <button
            key={`${s}-${i}`}
            onClick={() => onSelect(s)}
            onKeyDown={(e) => handleKey(e, s)}
            className="whitespace-nowrap border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-secondary)] shadow-[2px_2px_0px_0px_var(--color-border)] transition-all duration-150 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_var(--color-border)] hover:text-[var(--color-text-primary)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_var(--color-border)] animate-fade-in shrink-0"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
