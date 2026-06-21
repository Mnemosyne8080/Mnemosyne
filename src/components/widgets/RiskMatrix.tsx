import React from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

interface RiskMatrixProps {
  data: {
    confidenceIndex: number;
    risks: Array<{
      name: string;
      impact: 'High' | 'Medium' | 'Low';
      likelihood: 'High' | 'Medium' | 'Low';
      mitigation: string;
    }>;
  };
  onHumanDecision: (decision: string) => void;
  decisionMade: boolean;
}

export function RiskMatrix({ data, onHumanDecision, decisionMade }: RiskMatrixProps) {
  return (
    <Card className="my-6 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>RISK MATRIX & STRESS TEST</CardTitle>
        <div className="font-mono text-sm font-bold bg-black text-white px-2 py-1">
          CONFIDENCE: {data.confidenceIndex}%
        </div>
      </CardHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {data.risks.map((risk, idx) => (
          <div key={idx} className="border-2 border-black p-4 hover:bg-gray-100 transition-colors group relative">
             <div className="flex justify-between items-start mb-2">
               <h4 className="font-mono font-bold uppercase">{risk.name}</h4>
               <span className={cn(
                 "text-xs px-1 font-bold uppercase border-2",
                 risk.impact === 'High' ? "bg-red-200 border-red-500" : 
                 risk.impact === 'Medium' ? "bg-yellow-200 border-yellow-500" : "bg-green-200 border-green-500"
               )}>
                 {risk.impact} IMP / {risk.likelihood} LIK
               </span>
             </div>
             <p className="font-mono text-sm text-gray-700 mt-2">
               <span className="font-bold underline">MITIGATION:</span> {risk.mitigation}
             </p>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-4 border-t-2 border-black">
        <p className="font-mono text-sm font-bold mb-4 uppercase">Human-in-the-Loop Safeguard: Do you accept these mitigations or pivot?</p>
        <div className="flex gap-4">
          <Button disabled={decisionMade} onClick={() => onHumanDecision('ACCEPT_RISKS')} className="w-full">
            ACCEPT & PROCEED
          </Button>
          <Button disabled={decisionMade} onClick={() => onHumanDecision('PIVOT_STRATEGY')} variant="danger" className="w-full">
            PIVOT STRATEGY
          </Button>
        </div>
      </div>
    </Card>
  );
}
