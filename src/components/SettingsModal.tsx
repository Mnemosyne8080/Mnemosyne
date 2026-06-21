import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { Settings as SettingsIcon, X } from 'lucide-react';

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { baseUrl, modelName, apiKey, setBaseUrl, setModelName, setApiKey, clearChat } = useAppStore();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        ref={panelRef}
        className="panel-brutal-static max-w-md w-full bg-[var(--color-surface)] max-h-[90vh] overflow-y-auto animate-scale-in"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b-2 border-[var(--color-border)]">
          <h2 className="text-xl font-black uppercase tracking-[0.12em] flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6" />
            Config
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {/* Base URL */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-secondary)] mb-2">
              Base URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="input-brutal w-full"
              placeholder="https://api.openai.com/v1"
            />
          </div>

          {/* Model Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-secondary)] mb-2">
              Model Name
            </label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="input-brutal w-full"
              placeholder="gpt-4o"
            />
          </div>

          {/* API Key */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-secondary)] mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="input-brutal w-full font-sans"
              placeholder="sk-..."
            />
            <p className="font-mono text-[10px] text-[var(--color-text-muted)] mt-1.5">
              Stored locally in your browser.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t-2 border-[var(--color-border)] space-y-3">
          {/* Keyboard shortcuts hint */}
          <div className="font-mono text-[9px] text-[var(--color-text-muted)] flex flex-wrap gap-x-3 gap-y-1">
            <span>⌘K Focus input</span>
            <span>⌘/ Settings</span>
            <span>⌘N New chat</span>
            <span>Esc Close</span>
          </div>

          {/* Danger Zone */}
          <div className="border-t-2 border-[var(--color-border)] pt-3">
            <button
              onClick={() => {
                if (confirm('Clear all stored data? This cannot be undone.')) {
                  localStorage.clear();
                  clearChat();
                  window.location.reload();
                }
              }}
              className="btn-brutal text-[11px] border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white"
            >
              Clear All Data
            </button>
          </div>

          <div className="flex justify-end">
            <button onClick={onClose} className="btn-brutal-dark">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
