import React, { useRef } from 'react';
import { useAppStore } from '../store';
import { Download, Lightbulb, AlertTriangle, Target, MapPin, CircleDot } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export function PlanPanel() {
  const { plan, exportTrigger } = useAppStore();
  const planRef = useRef<HTMLDivElement>(null);

  const exportPDF = () => {
    if (!planRef.current) return;
    const opt = {
      margin:       10,
      filename:     'mnemosyne-plan.pdf',
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] },
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    html2pdf().set(opt).from(planRef.current).save();
  };

  React.useEffect(() => {
    if (exportTrigger > 0) {
      exportPDF();
    }
  }, [exportTrigger]);

  const hasContent = plan.idea || plan.assumptions?.length || plan.risks?.length || plan.milestones?.length;

  return (
    <div className="h-full flex flex-col bg-[var(--color-surface)] border-l-2 border-[var(--color-border)]">
      {/* Header */}
      <div className="px-5 py-3.5 border-b-2 border-[var(--color-border)] bg-[var(--color-surface)] z-10 flex justify-between items-center shrink-0">
        <h2 className="text-lg font-bold uppercase tracking-[0.12em] leading-none flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          The Roadmap
        </h2>
        <button
          onClick={exportPDF}
          disabled={!hasContent}
          className="btn-brutal flex items-center gap-2 px-3 py-1.5 text-[11px] disabled:opacity-30 disabled:pointer-events-none"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" ref={planRef}>
        {!hasContent && (
          <div className="h-full flex items-center justify-center p-8">
            <div className="placeholder-box w-full max-w-xs flex-col gap-3 text-center">
              <CircleDot className="w-6 h-6 text-[var(--color-text-muted)]" />
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                Waiting for an idea...
              </p>
            </div>
          </div>
        )}

        {hasContent && (
          <div className="p-5 space-y-8 pb-16">
            {/* Core Idea */}
            {plan.idea && (
              <section className="animate-fade-in">
                <h3 className="section-heading flex items-center gap-2 mb-4">
                  <Lightbulb className="w-4 h-4" />
                  Core Idea
                </h3>
                <p className="font-mono text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                  {plan.idea}
                </p>
              </section>
            )}

            {/* Assumptions */}
            {plan.assumptions?.length > 0 && (
              <section className="animate-fade-in">
                <h3 className="section-heading mb-4">Assumptions</h3>
                <ul className="space-y-3">
                  {plan.assumptions.map((a, i) => (
                    <li key={i} className="border-l-3 border-[var(--color-border)] pl-4 py-1">
                      <div className="font-mono text-[13px] leading-relaxed text-[var(--color-text-primary)] mb-2">
                        {a.text}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`tag ${
                          a.confidence === 'high'
                            ? 'bg-[var(--color-border)] text-[var(--color-base)] border-[var(--color-border)]'
                            : a.confidence === 'medium'
                              ? 'bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] border-[var(--color-border-light)]'
                              : 'bg-[var(--color-error)] text-white border-[var(--color-error)]'
                        }`}>
                          {a.confidence}
                        </span>
                        <span className="tag bg-transparent text-[var(--color-text-muted)] border-[var(--color-border-light)]">
                          {a.validationStatus}
                        </span>
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
                </h3>
                <ul className="space-y-3">
                  {plan.risks.map((r, i) => (
                    <li key={i} className="panel-brutal-static p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold uppercase tracking-[0.1em] text-[11px] text-[var(--color-text-secondary)]">
                          Risk #{i + 1}
                        </span>
                        <span className="tag bg-[var(--color-border)] text-[var(--color-base)] border-[var(--color-border)]">
                          {r.severity}
                        </span>
                      </div>
                      <p className="font-mono text-[13px] leading-relaxed text-[var(--color-text-primary)] mb-2.5">
                        {r.text}
                      </p>
                      <div className="bg-[var(--color-surface-raised)] p-2.5 font-mono text-[11px] leading-relaxed border-l-2 border-[var(--color-border)] text-[var(--color-text-secondary)]">
                        <span className="font-bold text-[var(--color-text-primary)]">Mitigation: </span>
                        {r.mitigation}
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
                </h3>
                <div className="space-y-0">
                  {plan.milestones.map((m, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-border)] flex items-center justify-center font-bold text-xs bg-[var(--color-surface)] shrink-0 z-10 text-[var(--color-text-primary)]">
                          {i + 1}
                        </div>
                        {i !== plan.milestones.length - 1 && (
                          <div className="w-0.5 bg-[var(--color-border)] flex-1 my-1" />
                        )}
                      </div>
                      <div className="pb-6 pt-1">
                        <h4 className="font-bold uppercase tracking-[0.08em] text-sm text-[var(--color-text-primary)]">
                          {m.title}
                        </h4>
                        <p className="font-mono text-[12px] text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                          {m.description}
                        </p>
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
                <p className="font-mono text-[13px] leading-relaxed text-white/90">
                  {plan.firstAction}
                </p>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
