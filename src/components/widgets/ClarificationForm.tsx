import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface ClarificationFormProps {
  data: {
    questions: Array<{
      id: string;
      type: 'text' | 'textarea' | 'radio' | 'slider' | 'boolean' | 'scale' | 'multiselect';
      label: string;
      context?: string;
      options?: string[];
      min?: number;
      max?: number;
      step?: number;
    }>;
  };
  onSubmit: (responses: Record<string, any>) => void;
  onSkip?: () => void;
  isSubmitted: boolean;
}

export function ClarificationForm({ data, onSubmit, onSkip, isSubmitted }: ClarificationFormProps) {
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
            <label className="font-mono text-sm font-bold uppercase block">{q.label}</label>
            {q.context && (
              <p className="font-mono text-xs text-gray-500 italic">({q.context})</p>
            )}

            {q.type === 'text' && (
              <Input
                disabled={isSubmitted}
                value={responses[q.id] || ''}
                onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                placeholder="Type your answer..."
              />
            )}

            {q.type === 'textarea' && (
              <textarea
                disabled={isSubmitted}
                value={responses[q.id] || ''}
                onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                placeholder="Type your answer..."
                rows={3}
                className="w-full px-3 py-2 border-2 border-black font-mono text-sm bg-white focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] resize-none"
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
                    step={q.step || 1}
                    disabled={isSubmitted}
                    value={responses[q.id] ?? q.min}
                    onChange={(e) => setResponses({ ...responses, [q.id]: Number(e.target.value) })}
                    className="flex-1 accent-black cursor-pointer"
                  />
                  <input
                    type="number"
                    min={q.min}
                    max={q.max}
                    step={q.step || 1}
                    disabled={isSubmitted}
                    value={responses[q.id] ?? q.min}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val) && val >= (q.min ?? 0) && val <= (q.max ?? Infinity)) {
                        setResponses({ ...responses, [q.id]: val });
                      }
                    }}
                    className="w-24 px-2 py-1 border-2 border-black font-mono font-bold text-center bg-white focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-gray-400 uppercase">
                  <span>{q.min}</span>
                  <span>{q.max}</span>
                </div>
              </div>
            )}

            {q.type === 'boolean' && (
              <div className="flex gap-3">
                {['Yes', 'No'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() => setResponses({ ...responses, [q.id]: opt === 'Yes' })}
                    className={cn(
                      "px-4 py-2 font-mono text-sm font-bold border-2 border-black transition-all",
                      responses[q.id] === (opt === 'Yes')
                        ? "bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-white text-black hover:bg-gray-100 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)]"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {q.type === 'scale' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  {Array.from({ length: (q.max ?? 10) - (q.min ?? 1) + 1 }, (_, i) => {
                    const val = (q.min ?? 1) + i;
                    return (
                      <button
                        key={val}
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => setResponses({ ...responses, [q.id]: val })}
                        className={cn(
                          "w-9 h-9 font-mono text-sm font-bold border-2 border-black transition-all",
                          responses[q.id] === val
                            ? "bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            : "bg-white text-black hover:bg-gray-100"
                        )}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] font-mono text-gray-400 uppercase">
                  <span>{q.min} — Low</span>
                  <span>{q.max} — High</span>
                </div>
              </div>
            )}

            {q.type === 'multiselect' && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {q.options?.map(opt => {
                    const selected: string[] = responses[q.id] || [];
                    const isSelected = selected.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => {
                          const current: string[] = responses[q.id] || [];
                          if (isSelected) {
                            setResponses({ ...responses, [q.id]: current.filter(v => v !== opt) });
                          } else {
                            setResponses({ ...responses, [q.id]: [...current, opt] });
                          }
                        }}
                        className={cn(
                          "px-3 py-1.5 font-mono text-sm border-2 border-black transition-all flex items-center gap-1.5",
                          isSelected
                            ? "bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            : "bg-white text-black hover:bg-gray-100 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)]"
                        )}
                      >
                        <span className={cn(
                          "w-3 h-3 border-2 flex-shrink-0 flex items-center justify-center text-[8px]",
                          isSelected ? "border-white bg-white text-black" : "border-gray-400"
                        )}>
                          {isSelected && '✓'}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                <p className="font-mono text-[10px] text-gray-400 uppercase">Select one or more</p>
              </div>
            )}
          </div>
        ))}

        <div className="flex gap-3 mt-4">
          <Button
            type="submit"
            disabled={isSubmitted}
            className="flex-1 text-lg"
          >
            {isSubmitted ? 'RESPONSES SUBMITTED' : '[SUBMIT RESPONSES]'}
          </Button>
          {!isSubmitted && onSkip && (
            <Button
              type="button"
              variant="secondary"
              onClick={onSkip}
              className="flex-1 text-lg"
            >
              [SKIP &amp; PROCEED]
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
