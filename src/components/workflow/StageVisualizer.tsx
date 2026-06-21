import React from 'react';
import { WorkflowStage } from '../../types';
import { cn } from '../../lib/utils';
import { ChevronRight } from 'lucide-react';

interface StageVisualizerProps {
  currentStage: WorkflowStage;
}

const STAGES: { id: WorkflowStage; label: string }[] = [
  { id: 'INTAKE', label: 'INTAKE' },
  { id: 'CLARIFY', label: 'CLARIFY' },
  { id: 'STRESS_TEST', label: 'STRESS-TEST' },
  { id: 'FINALIZE', label: 'FINALIZER' },
];

export function StageVisualizer({ currentStage }: StageVisualizerProps) {
  const currentIndex = STAGES.findIndex(s => s.id === currentStage);

  return (
    <div className="flex items-center justify-between p-4 border-b-4 border-black bg-white overflow-x-auto">
      {STAGES.map((stage, idx) => {
        const isActive = idx === currentIndex;
        const isPast = idx < currentIndex;
        
        return (
          <React.Fragment key={stage.id}>
            <div 
              className={cn(
                "flex items-center px-3 py-1 font-mono text-xs font-black uppercase tracking-widest border-2",
                isActive ? "bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : 
                isPast ? "bg-gray-200 text-gray-500 border-gray-400" : "bg-white text-gray-400 border-gray-200"
              )}
            >
              [{stage.label}]
            </div>
            {idx < STAGES.length - 1 && (
              <ChevronRight className={cn(
                "w-5 h-5 flex-shrink-0 mx-2",
                isPast ? "text-black" : "text-gray-300"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
