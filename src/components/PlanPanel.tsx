import React, { useRef } from 'react';
import { useAppStore } from '../store';
import { Download } from 'lucide-react';
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
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(planRef.current).save();
  };

  React.useEffect(() => {
    if (exportTrigger > 0) {
      exportPDF();
    }
  }, [exportTrigger]);

  return (
    <div className="h-full flex flex-col bg-white border-l-4 border-black">
      <div className="p-4 border-b-4 border-black bg-white z-10 flex justify-between items-center">
        <h2 className="text-xl font-bold uppercase tracking-widest leading-none">The Roadmap</h2>
        <button onClick={exportPDF} className="btn-brutal flex items-center gap-2 px-3 py-1 text-xs">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6" ref={planRef}>
        {!plan.idea && (
          <div className="h-full flex items-center justify-center text-center opacity-50 p-6 border-4 border-dashed border-[#d1d5db]">
            <p className="font-mono uppercase tracking-widest text-sm">Waiting for an idea...</p>
          </div>
        )}

        {plan.idea && (
          <div className="space-y-8 pb-12">
            <section>
              <h3 className="font-black uppercase tracking-widest text-lg border-b-2 border-black pb-1 mb-4">Core Idea</h3>
              <p className="font-mono text-sm leading-relaxed">{plan.idea}</p>
            </section>

            {plan.assumptions?.length > 0 && (
              <section>
                <h3 className="font-black uppercase tracking-widest text-lg border-b-2 border-black pb-1 mb-4">Assumptions</h3>
                <ul className="space-y-3">
                  {plan.assumptions.map((a, i) => (
                    <li key={i} className="border-l-4 border-black pl-4 py-1">
                      <div className="font-mono text-sm mb-1">{a.text}</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`inline-block text-[10px] uppercase tracking-widest font-bold px-2 pt-1.5 pb-1 border-2 ${
                          a.confidence === 'high' ? 'bg-black text-white border-black' : a.confidence === 'medium' ? 'bg-[#cccccc] border-black' : 'bg-[#ef4444] text-white border-black'
                        }`}>
                          CONFIDENCE: {a.confidence}
                        </span>
                        <span className="inline-block text-[10px] uppercase tracking-widest font-bold px-2 pt-1.5 pb-1 border-2 border-black text-black">
                          {a.validationStatus}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {plan.risks?.length > 0 && (
              <section>
                <h3 className="font-black uppercase tracking-widest text-lg border-b-2 border-black pb-1 mb-4">Risks</h3>
                <ul className="space-y-4">
                  {plan.risks.map((r, i) => (
                    <li key={i} className="panel-brutal p-3 shadow-none border-b-4 border-r-4">
                      <div className="flex items-center justify-between mb-2">
                         <span className="font-bold uppercase tracking-widest text-xs">Risk</span>
                         <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 pt-1.5 pb-1 border-2 border-black bg-black text-white`}>
                           {r.severity}
                         </span>
                      </div>
                      <p className="font-mono text-sm mb-2">{r.text}</p>
                      <div className="bg-[#f3f4f6] p-2 font-mono text-xs border-l-2 border-black">
                        <strong>Mitigation:</strong> {r.mitigation}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {plan.milestones?.length > 0 && (
               <section>
                <h3 className="font-black uppercase tracking-widest text-lg border-b-2 border-black pb-1 mb-4">Phased Execution</h3>
                <div className="space-y-0">
                  {plan.milestones.map((m, i) => (
                    <div key={i} className="flex gap-4">
                       <div className="flex flex-col items-center">
                         <div className="w-8 h-8 rounded-full border-4 border-black flex items-center justify-center font-bold text-sm bg-white shrink-0 z-10">{i+1}</div>
                         {i !== plan.milestones.length - 1 && <div className="w-1 bg-black flex-1 -my-2" />}
                       </div>
                       <div className="pb-8 pt-1">
                         <h4 className="font-bold uppercase tracking-wide text-md">{m.title}</h4>
                         <p className="font-mono text-xs text-[#374151] mt-1">{m.description}</p>
                       </div>
                    </div>
                  ))}
                </div>
               </section>
            )}

             {plan.firstAction && (
              <section className="bg-black text-white p-6 -mx-6 mt-8">
                <h3 className="font-black uppercase tracking-widest text-lg border-b-2 border-white pb-1 mb-4">First Action</h3>
                <p className="font-mono text-md">{plan.firstAction}</p>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
