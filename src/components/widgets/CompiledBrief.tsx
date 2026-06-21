import React from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface CompiledBriefProps {
  data: {
    idea?: string;
    targetAudience?: string;
    keyDifferentiators?: string[];
    constraints?: string[];
    userPreferences?: Record<string, string>;
    risksAccepted?: boolean;
    researchSummary?: string;
  };
  onAccept: () => void;
  isAccepted: boolean;
}

export function CompiledBrief({ data, onAccept, isAccepted }: CompiledBriefProps) {
  return (
    <Card className="mt-2">
      <h3 className="font-mono text-sm font-black uppercase tracking-widest mb-3 border-b-2 border-black pb-2">
        [COMPILED BRIEF]
      </h3>

      {data.idea && (
        <div className="mb-3">
          <span className="font-mono text-xs font-bold uppercase text-gray-500">Idea</span>
          <p className="font-mono text-sm mt-1">{data.idea}</p>
        </div>
      )}

      {data.targetAudience && (
        <div className="mb-3">
          <span className="font-mono text-xs font-bold uppercase text-gray-500">Target Audience</span>
          <p className="font-mono text-sm mt-1">{data.targetAudience}</p>
        </div>
      )}

      {data.keyDifferentiators && data.keyDifferentiators.length > 0 && (
        <div className="mb-3">
          <span className="font-mono text-xs font-bold uppercase text-gray-500">Key Differentiators</span>
          <ul className="list-disc list-inside font-mono text-sm mt-1">
            {data.keyDifferentiators.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}

      {data.constraints && data.constraints.length > 0 && (
        <div className="mb-3">
          <span className="font-mono text-xs font-bold uppercase text-gray-500">Constraints</span>
          <ul className="list-disc list-inside font-mono text-sm mt-1">
            {data.constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {data.researchSummary && (
        <div className="mb-3">
          <span className="font-mono text-xs font-bold uppercase text-gray-500">Research Summary</span>
          <p className="font-mono text-sm mt-1">{data.researchSummary}</p>
        </div>
      )}

      {!isAccepted && (
        <div className="mt-4 pt-3 border-t-2 border-black">
          <Button onClick={onAccept} className="w-full">
            ACCEPT BRIEF &amp; FINALIZE
          </Button>
        </div>
      )}
    </Card>
  );
}
