import React from 'react';
import { useAppStore } from '../store';
import { X, Play, Square, Zap, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

interface WorkflowPanelProps {
  onClose: () => void;
  onCreateWorkflow: () => void;
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  pending: { icon: <Clock className="w-3.5 h-3.5" />, color: 'text-[var(--color-text-muted)]', bg: 'bg-[var(--color-surface-raised)]' },
  running: { icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, color: 'text-amber-600', bg: 'bg-amber-50' },
  completed: { icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-[#3a7d44]', bg: 'bg-green-50' },
  failed: { icon: <XCircle className="w-3.5 h-3.5" />, color: 'text-[#c4553a]', bg: 'bg-red-50' },
  cancelled: { icon: <Square className="w-3.5 h-3.5" />, color: 'text-[var(--color-text-muted)]', bg: 'bg-[var(--color-surface-raised)]' },
};

export function WorkflowPanel({ onClose, onCreateWorkflow }: WorkflowPanelProps) {
  const workflows = useAppStore((s) => s.workflows);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-[340px] bg-[var(--color-surface)] border-l-2 border-[var(--color-border)] shadow-[-4px_0px_0px_0px_var(--color-border)] flex flex-col animate-slide-left">
      {/* Header */}
      <div className="px-4 py-3.5 border-b-2 border-[var(--color-border)] flex justify-between items-center shrink-0">
        <h2 className="text-sm font-black uppercase tracking-[0.12em] flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Workflows
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] transition-colors"
          aria-label="Close workflows"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* New Workflow Button */}
      <div className="p-3 border-b border-[var(--color-border-light)]">
        <button
          onClick={onCreateWorkflow}
          className="btn-brutal w-full flex items-center justify-center gap-2 py-2.5 text-[11px]"
        >
          <Play className="w-3.5 h-3.5" />
          New Workflow
        </button>
      </div>

      {/* Workflow List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {workflows.length === 0 && (
          <div className="placeholder-box flex-col gap-3 text-center mt-8">
            <Zap className="w-6 h-6 text-[var(--color-text-muted)]" />
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              No workflows yet
            </p>
          </div>
        )}

        {workflows.map((w) => {
          const cfg = statusConfig[w.status] || statusConfig.pending;
          return (
            <div
              key={w.id}
              className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] shadow-[3px_3px_0px_0px_rgba(26,25,23,0.12)] p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cfg.color}>{cfg.icon}</span>
                  <span className="font-mono text-xs truncate text-[var(--color-text-primary)]">
                    {w.title}
                  </span>
                </div>
                <span className="tag bg-transparent text-[var(--color-text-muted)] border-[var(--color-border-light)] text-[8px]">
                  {w.config?.type || 'custom'}
                </span>
              </div>

              {/* Subagent progress */}
              {w.subagents && w.subagents.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {w.subagents.map((sa) => (
                    <div key={sa.id} className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[var(--color-surface-raised)] border border-[var(--color-border-light)] overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            sa.status === 'completed'
                              ? 'bg-[#3a7d44]'
                              : sa.status === 'failed'
                                ? 'bg-[#c4553a]'
                                : 'bg-amber-500'
                          }`}
                          style={{ width: `${sa.progress || 0}%` }}
                        />
                      </div>
                      <span className="font-mono text-[8px] text-[var(--color-text-muted)] w-16 truncate text-right">
                        {sa.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Results summary */}
              {w.status === 'completed' && w.results && (
                <div className="mt-2 pt-2 border-t border-[var(--color-border-light)]">
                  <span className="font-mono text-[9px] text-[#3a7d44] uppercase tracking-[0.1em]">
                    ✓ Completed
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
