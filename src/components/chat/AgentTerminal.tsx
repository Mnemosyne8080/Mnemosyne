import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface AgentTerminalProps {
  agentName: string;
  isProcessing: boolean;
  nextStageLoading?: string | null;
  thoughtStream?: string[];
}

export function AgentTerminal({ agentName, isProcessing, nextStageLoading, thoughtStream = [] }: AgentTerminalProps) {
  const [isOpen, setIsOpen] = useState(isProcessing);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (isProcessing) setIsOpen(true);
  }, [isProcessing]);

  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);
    return () => clearInterval(interval);
  }, [isProcessing]);

  if (!isProcessing && !nextStageLoading && thoughtStream.length === 0) return null;

  return (
    <div className="my-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full max-w-3xl mx-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 font-mono text-xs font-bold uppercase cursor-pointer transition-colors",
          isProcessing
            ? "bg-black text-white"
            : "bg-gray-900 text-green-400"
        )}
      >
        <div className="flex items-center gap-2">
          {(isProcessing || nextStageLoading) && (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
          {agentName} // {
            nextStageLoading
              ? `LOADING ${nextStageLoading}...`
              : isProcessing
                ? `THINKING${dots}`
                : 'DONE'
          }
        </div>
        <div>
          {isOpen ? '[− COLLAPSE]' : '[+ EXPAND]'}
        </div>
      </button>

      {isOpen && (
        <div className="bg-gray-900 text-green-400 p-4 font-mono text-xs overflow-y-auto max-h-48 space-y-1">
          {thoughtStream.map((line, idx) => (
            <div key={idx} className="opacity-90">{`> ${line}`}</div>
          ))}
          {isProcessing && (
            <div className="flex items-center gap-1 text-yellow-400">
              <span className="inline-block w-2 h-3 bg-green-400 animate-pulse" />
              <span>Awaiting response...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
