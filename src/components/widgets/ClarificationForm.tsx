import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

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
              <div className="flex gap-4">
                {q.options?.map(opt => (
                  <label key={opt} className="flex items-center space-x-2 font-mono text-sm cursor-pointer">
                    <input 
                      type="radio" 
                      name={q.id} 
                      value={opt}
                      disabled={isSubmitted}
                      onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                      className="w-4 h-4 text-black border-2 border-black focus:ring-black"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            )}
            {q.type === 'slider' && (
              <div className="flex items-center space-x-4">
                <input 
                  type="range" 
                  min={q.min} 
                  max={q.max} 
                  disabled={isSubmitted}
                  onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                  className="w-full accent-black cursor-pointer"
                />
                <span className="font-mono font-bold">{responses[q.id] || q.min}</span>
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
