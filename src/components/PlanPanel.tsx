import React, { useRef, useState } from 'react';
import { useAppStore } from '../store';
import {
  Download, Lightbulb, AlertTriangle, Target, MapPin, CircleDot,
  Plus, Trash2, Edit3, GitBranch, Map,
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import PlanGraphView from './PlanGraphView';

export function PlanPanel() {
  const { plan, exportTrigger, updatePlanField, addPlanItem, removePlanItem, reorderMilestones, planView, setPlanView, currentConversationId, user } = useAppStore();
  const planRef = useRef<HTMLDivElement>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const exportPDF = () => {
    if (!planRef.current) return;
    const opt = {
      margin: 10,
      filename: 'mnemosyne-plan.pdf',
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    };
    html2pdf().set(opt).from(planRef.current).save();
  };

  React.useEffect(() => {
    if (exportTrigger > 0) {
      exportPDF();
    }
  }, [exportTrigger]);

  const hasContent = plan.idea || plan.assumptions?.length || plan.risks?.length || plan.milestones?.length;

  const startEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const saveEdit = (field: string) => {
    if (editValue.trim()) {
      updatePlanField(field as any, editValue.trim());
    }
    setEditingField(null);
    setEditValue('');
  };

  const handleAddAssumption = () => {
    addPlanItem('assumptions', { text: '', confidence: 'medium', validationStatus: 'pending' });
  };

  const handleAddRisk = () => {
    addPlanItem('risks', { text: '', severity: 'medium', mitigation: '' });
  };

  const handleAddMilestone = () => {
    addPlanItem('milestones', { title: '', description: '' });
  };

  const updateAssumption = (index: number, field: string, value: string) => {
    const updated = [...(plan.assumptions || [])];
    updated[index] = { ...updated[index], [field]: value };
    updatePlanField('assumptions', updated);
  };

  const updateRisk = (index: number, field: string, value: string) => {
    const updated = [...(plan.risks || [])];
    updated[index] = { ...updated[index], [field]: value };
    updatePlanField('risks', updated);
  };

  const updateMilestone = (index: number, field: string, value: string) => {
    const updated = [...(plan.milestones || [])];
    updated[index] = { ...updated[index], [field]: value };
    updatePlanField('milestones', updated);
  };

  return (
    <div className="h-full flex flex-col bg-[var(--color-surface)] border-l-2 border-[var(--color-border)]">
      {/* Header */}
      <div className="px-5 py-3.5 border-b-2 border-[var(--color-border)] bg-[var(--color-surface)] z-10 flex justify-between items-center shrink-0">
        <h2 className="text-lg font-bold uppercase tracking-[0.12em] leading-none flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          The Roadmap
        </h2>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <button
            onClick={() => setPlanView(planView === 'roadmap' ? 'graph' : 'roadmap')}
            className="btn-brutal-sm flex items-center gap-1.5 px-2.5 py-1"
            title={planView === 'roadmap' ? 'Graph view' : 'Roadmap view'}
          >
            {planView === 'roadmap' ? (
              <>
                <GitBranch className="w-3 h-3" />
                <span className="hidden sm:inline">Graph</span>
              </>
            ) : (
              <>
                <Map className="w-3 h-3" />
                <span className="hidden sm:inline">Roadmap</span>
              </>
            )}
          </button>
          <button
            onClick={exportPDF}
            disabled={!hasContent}
            className="btn-brutal flex items-center gap-2 px-3 py-1.5 text-[11px] disabled:opacity-30 disabled:pointer-events-none"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" ref={planRef}>
        {!hasContent && planView === 'roadmap' && (
          <div className="h-full flex items-center justify-center p-8">
            <div className="placeholder-box w-full max-w-xs flex-col gap-3 text-center">
              <CircleDot className="w-6 h-6 text-[var(--color-text-muted)]" />
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                Waiting for an idea...
              </p>
            </div>
          </div>
        )}

        {hasContent && planView === 'roadmap' && (
          <div className="p-5 space-y-8 pb-16">
            {/* Core Idea */}
            {plan.idea && (
              <section className="animate-fade-in">
                <h3 className="section-heading flex items-center gap-2 mb-4 group cursor-pointer hover:text-[var(--color-accent)] transition-colors">
                  <Lightbulb className="w-4 h-4" />
                  Core Idea
                  <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                </h3>
                {editingField === 'idea' ? (
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveEdit('idea')}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit('idea'); }}}
                    className="input-brutal w-full min-h-[80px]"
                    autoFocus
                  />
                ) : (
                  <p
                    className="font-mono text-[13px] leading-relaxed text-[var(--color-text-secondary)] cursor-pointer hover:text-[var(--color-text-primary)] transition-colors"
                    onClick={() => startEdit('idea', plan.idea)}
                  >
                    {plan.idea}
                  </p>
                )}
              </section>
            )}

            {/* Assumptions */}
            {plan.assumptions?.length > 0 && (
              <section className="animate-fade-in">
                <h3 className="section-heading flex items-center gap-2 mb-4">
                  Assumptions
                  <button onClick={handleAddAssumption} className="ml-auto p-1 hover:bg-[var(--color-surface-raised)] transition-colors" title="Add assumption">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </h3>
                <ul className="space-y-3">
                  {plan.assumptions.map((a, i) => (
                    <li key={i} className="border-l-3 border-[var(--color-border)] pl-4 py-1 group">
                      <div className="font-mono text-[13px] leading-relaxed text-[var(--color-text-primary)] mb-2">
                        {editingField === `assumption-${i}` ? (
                          <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => { updateAssumption(i, 'text', editValue); setEditingField(null); }}
                            onKeyDown={(e) => { if (e.key === 'Enter') { updateAssumption(i, 'text', editValue); setEditingField(null); }}}
                            className="input-brutal w-full"
                            autoFocus
                          />
                        ) : (
                          <span
                            className="cursor-pointer hover:text-[var(--color-accent)] transition-colors"
                            onClick={() => startEdit(`assumption-${i}`, a.text)}
                          >
                            {a.text}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span
                          className={`tag cursor-pointer ${
                            a.confidence === 'high'
                              ? 'bg-[var(--color-border)] text-[var(--color-base)] border-[var(--color-border)]'
                              : a.confidence === 'medium'
                                ? 'bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] border-[var(--color-border-light)]'
                                : 'bg-[var(--color-error)] text-white border-[var(--color-error)]'
                          }`}
                          onClick={() => {
                            const next = a.confidence === 'high' ? 'medium' : a.confidence === 'medium' ? 'low' : 'high';
                            updateAssumption(i, 'confidence', next);
                          }}
                        >
                          {a.confidence}
                        </span>
                        <span className="tag bg-transparent text-[var(--color-text-muted)] border-[var(--color-border-light)]">
                          {a.validationStatus}
                        </span>
                        <button
                          onClick={() => removePlanItem('assumptions', i)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-all ml-auto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Risks */}
            {plan.risks?.length > 0 && (
              <section className="animate-fade-in">
                <h3 className="section-heading flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4" />
                  Risks
                  <button onClick={handleAddRisk} className="ml-auto p-1 hover:bg-[var(--color-surface-raised)] transition-colors" title="Add risk">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </h3>
                <ul className="space-y-3">
                  {plan.risks.map((r, i) => (
                    <li key={i} className="panel-brutal-static p-3 group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold uppercase tracking-[0.1em] text-[11px] text-[var(--color-text-secondary)]">
                          Risk #{i + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className="tag bg-[var(--color-border)] text-[var(--color-base)] border-[var(--color-border)] cursor-pointer"
                            onClick={() => {
                              const next = r.severity === 'high' ? 'medium' : r.severity === 'medium' ? 'low' : 'high';
                              updateRisk(i, 'severity', next);
                            }}
                          >
                            {r.severity}
                          </span>
                          <button
                            onClick={() => removePlanItem('risks', i)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p
                        className="font-mono text-[13px] leading-relaxed text-[var(--color-text-primary)] mb-2.5 cursor-pointer hover:text-[var(--color-accent)] transition-colors"
                        onClick={() => startEdit(`risk-${i}-text`, r.text)}
                      >
                        {editingField === `risk-${i}-text` ? (
                          <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => { updateRisk(i, 'text', editValue); setEditingField(null); }}
                            onKeyDown={(e) => { if (e.key === 'Enter') { updateRisk(i, 'text', editValue); setEditingField(null); }}}
                            className="input-brutal w-full"
                            autoFocus
                          />
                        ) : (
                          r.text
                        )}
                      </p>
                      <div className="bg-[var(--color-surface-raised)] p-2.5 font-mono text-[11px] leading-relaxed border-l-2 border-[var(--color-border)] text-[var(--color-text-secondary)]">
                        <span className="font-bold text-[var(--color-text-primary)]">Mitigation: </span>
                        {editingField === `risk-${i}-mitigation` ? (
                          <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => { updateRisk(i, 'mitigation', editValue); setEditingField(null); }}
                            onKeyDown={(e) => { if (e.key === 'Enter') { updateRisk(i, 'mitigation', editValue); setEditingField(null); }}}
                            className="input-brutal w-full mt-1"
                            autoFocus
                          />
                        ) : (
                          <span
                            className="cursor-pointer hover:text-[var(--color-text-primary)] transition-colors"
                            onClick={() => startEdit(`risk-${i}-mitigation`, r.mitigation)}
                          >
                            {r.mitigation}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Phased Execution / Milestones */}
            {plan.milestones?.length > 0 && (
              <section className="animate-fade-in">
                <h3 className="section-heading flex items-center gap-2 mb-5">
                  <Target className="w-4 h-4" />
                  Phased Execution
                  <button onClick={handleAddMilestone} className="ml-auto p-1 hover:bg-[var(--color-surface-raised)] transition-colors" title="Add milestone">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </h3>
                <div className="space-y-0">
                  {plan.milestones.map((m, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-border)] flex items-center justify-center font-bold text-xs bg-[var(--color-surface)] shrink-0 z-10 text-[var(--color-text-primary)]">
                          {i + 1}
                        </div>
                        {i !== plan.milestones.length - 1 && (
                          <div className="w-0.5 flex-1 my-1 border-l-2 border-dashed border-[var(--color-border)]" />
                        )}
                      </div>
                      <div className="pb-6 pt-1 flex-1">
                        <h4
                          className="font-bold uppercase tracking-[0.08em] text-sm text-[var(--color-text-primary)] cursor-pointer hover:text-[var(--color-accent)] transition-colors"
                          onClick={() => startEdit(`milestone-${i}-title`, m.title)}
                        >
                          {editingField === `milestone-${i}-title` ? (
                            <input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => { updateMilestone(i, 'title', editValue); setEditingField(null); }}
                              onKeyDown={(e) => { if (e.key === 'Enter') { updateMilestone(i, 'title', editValue); setEditingField(null); }}}
                              className="input-brutal w-full"
                              autoFocus
                            />
                          ) : (
                            m.title
                          )}
                        </h4>
                        <p
                          className="font-mono text-[12px] text-[var(--color-text-secondary)] mt-1 leading-relaxed cursor-pointer hover:text-[var(--color-text-primary)] transition-colors"
                          onClick={() => startEdit(`milestone-${i}-desc`, m.description)}
                        >
                          {editingField === `milestone-${i}-desc` ? (
                            <textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => { updateMilestone(i, 'description', editValue); setEditingField(null); }}
                              className="input-brutal w-full min-h-[60px]"
                              autoFocus
                            />
                          ) : (
                            m.description
                          )}
                        </p>
                        <button
                          onClick={() => removePlanItem('milestones', i)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-all mt-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* First Action */}
            {plan.firstAction && (
              <section className="animate-fade-in bg-[var(--color-border)] text-[var(--color-base)] p-5 -mx-5 mb-0">
                <h3 className="font-black uppercase tracking-[0.12em] text-sm border-b-2 border-white/30 pb-2 mb-3 flex items-center gap-2">
                  <CircleDot className="w-4 h-4" />
                  First Action
                </h3>
                {editingField === 'firstAction' ? (
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveEdit('firstAction')}
                    className="input-brutal w-full min-h-[60px]"
                    autoFocus
                  />
                ) : (
                  <p
                    className="font-mono text-[13px] leading-relaxed text-white/90 cursor-pointer hover:text-white transition-colors"
                    onClick={() => startEdit('firstAction', plan.firstAction)}
                  >
                    {plan.firstAction}
                  </p>
                )}
              </section>
            )}
          </div>
        )}

        {/* Graph View */}
        {planView === 'graph' && <PlanGraphView />}
      </div>
    </div>
  );
}
