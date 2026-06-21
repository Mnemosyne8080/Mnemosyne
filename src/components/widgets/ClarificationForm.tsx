import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface ClarificationFormProps {
  data: {
    questions: Array<{
      id: string;
      type: 'text' | 'radio' | 'slider';
      label: string;
      options?: string[];
      min?: number;
      max?: number;
    }>;
  };
  onSubmit: (responses: Record<string, any>) => void;
  isSubmitted: boolean;
}

export function ClarificationForm({ data, onSubmit, isSubmitted }: ClarificationFormProps) {
  const [responses, setResponses] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmitted) {
      onSubmit(responses);
    }
  };

  return (
    <Card className="my-6 border-4 border-black bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader>
        <CardTitle>REQUIRED: ASSUMPTION CLARIFICATION</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        {data.questions.map((q) => (
          <div key={q.id} className="space-y-2">
            <label className="font-mono text-sm font-bold uppercase">{q.label}</label>
            {q.type === 'text' && (
              <Input 
                disabled={isSubmitted}
                onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
              />
            )}
            {q.type === 'radio' && (
              <div className="flex flex-wrap gap-2">
                {q.options?.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => setResponses({ ...responses, [q.id]: opt })}
                    className={cn(
                      "px-3 py-1.5 font-mono text-sm border-2 border-black transition-all",
                      responses[q.id] === opt
                        ? "bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-white text-black hover:bg-gray-100 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)]"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
            {q.type === 'slider' && (
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min={q.min}
                    max={q.max}
                    disabled={isSubmitted}
                    value={responses[q.id] ?? q.min}
                    onChange={(e) => setResponses({ ...responses, [q.id]: Number(e.target.value) })}
                    className="flex-1 accent-black cursor-pointer"
                  />
                  <input
                    type="number"
                    min={q.min}
                    max={q.max}
                    disabled={isSubmitted}
                    value={responses[q.id] ?? q.min}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val) && val >= (q.min ?? 0) && val <= (q.max ?? Infinity)) {
                        setResponses({ ...responses, [q.id]: val });
                      }
                    }}
                    className="w-20 px-2 py-1 border-2 border-black font-mono font-bold text-center bg-white focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-gray-400 uppercase">
                  <span>{q.min}</span>
                  <span>{q.max}</span>
                </div>
              </div>
            )}
          </div>
        ))}
        <Button 
          type="submit" 
          disabled={isSubmitted} 
          className="w-full text-lg mt-4"
        >
          {isSubmitted ? 'RESPONSES SUBMITTED' : '[SUBMIT RESPONSES TO SUBAGENT]'}
        </Button>
      </form>
    </Card>
  );
}
