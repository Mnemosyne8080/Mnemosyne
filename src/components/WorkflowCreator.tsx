import React, { useState } from 'react';
import { useAppStore } from '../store';
import type { WorkflowConfig } from '../lib/workflows/types';
import { X, FlaskConical, ShieldCheck, Map, Wrench } from 'lucide-react';

interface WorkflowCreatorProps {
  onClose: () => void;
}

const WORKFLOW_TYPES = [
  { key: 'research' as const, label: 'Research', icon: FlaskConical, desc: 'Fan out researcher agents on different angles' },
  { key: 'validate' as const, label: 'Validate', icon: ShieldCheck, desc: 'Check assumptions with parallel validators' },
  { key: 'plan' as const, label: 'Plan', icon: Map, desc: 'Generate plans with different strategies' },
  { key: 'custom' as const, label: 'Custom', icon: Wrench, desc: 'Define your own workflow prompt' },
];

export function WorkflowCreator({ onClose }: WorkflowCreatorProps) {
  const [type, setType] = useState<WorkflowConfig['type']>('research');
  const [fanOut, setFanOut] = useState(3);
  const [angles, setAngles] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [strategies, setStrategies] = useState<string[]>(['MVP-first', 'conservative']);
  const startWorkflow = useAppStore((s) => s.startWorkflow);

  const handleStart = async () => {
    const config: WorkflowConfig = {
      type,
      fanOutCount: fanOut,
      ...(type === 'research' && { researchAngles: angles.split(',').map((a) => a.trim()).filter(Boolean) }),
      ...(type === 'plan' && { planStrategies: strategies }),
      ...(type === 'custom' && { customPrompt }),
    };
    await startWorkflow(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div
        className="panel-brutal-static max-w-md w-full bg-[var(--color-surface)] max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b-2 border-[var(--color-border)]">
          <h2 className="text-lg font-black uppercase tracking-[0.12em]">New Workflow</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-raised)] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Type selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-secondary)] mb-3">
              Workflow Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {WORKFLOW_TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    onClick={() => setType(t.key)}
                    className={`flex flex-col items-center gap-1.5 p-3 border-2 transition-all duration-150 ${
                      type === t.key
                        ? 'border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[2px_2px_0px_0px_var(--color-border)]'
                        : 'border-[var(--color-border-light)] hover:border-[var(--color-border)]'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-[var(--color-text-primary)]" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-primary)]">
                      {t.label}
                    </span>
                    <span className="font-mono text-[8px] text-[var(--color-text-muted)] text-center leading-tight">
                      {t.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Research config */}
          {type === 'research' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-secondary)] mb-2">
                Research Angles (comma-separated)
              </label>
              <input
                type="text"
                value={angles}
                onChange={(e) => setAngles(e.target.value)}
                className="input-brutal w-full"
                placeholder="market size, competition, pricing, trends..."
              />
            </div>
          )}

          {/* Plan config */}
          {type === 'plan' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-secondary)] mb-2">
                Planning Strategies
              </label>
              <div className="space-y-2">
                {['MVP-first', 'conservative', 'aggressive', 'enterprise-grade'].map((s) => (
                  <label key={s} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={strategies.includes(s)}
                      onChange={(e) => {
                        if (e.target.checked) setStrategies([...strategies, s]);
                        else setStrategies(strategies.filter((x) => x !== s));
                      }}
                      className="w-4 h-4 border-2 border-[var(--color-border)]"
                    />
                    <span className="font-mono text-xs uppercase text-[var(--color-text-secondary)]">
                      {s}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Custom config */}
          {type === 'custom' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-secondary)] mb-2">
                Custom Prompt
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="input-brutal w-full h-24 resize-none"
                placeholder="Describe what the subagents should do..."
              />
            </div>
          )}

          {/* Fan-out count */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-secondary)] mb-2">
              Parallel Agents: {fanOut}
            </label>
            <input
              type="range"
              min={2}
              max={10}
              value={fanOut}
              onChange={(e) => setFanOut(Number(e.target.value))}
              className="w-full accent-[var(--color-border)]"
            />
            <div className="flex justify-between font-mono text-[9px] text-[var(--color-text-muted)] mt-1">
              <span>2</span>
              <span>10</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t-2 border-[var(--color-border)] flex justify-end gap-2">
          <button onClick={onClose} className="btn-brutal">
            Cancel
          </button>
          <button onClick={handleStart} className="btn-brutal-dark">
            Start Workflow
          </button>
        </div>
      </div>
    </div>
  );
}
