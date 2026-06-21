import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Terminal } from 'lucide-react';

interface AgentTerminalProps {
  agentName: string;
  isProcessing: boolean;
  thoughtStream?: string[];
}

export function AgentTerminal({ agentName, isProcessing, thoughtStream = [] }: AgentTerminalProps) {
  const [isOpen, setIsOpen] = useState(isProcessing);

  useEffect(() => {
    if (isProcessing) setIsOpen(true);
  }, [isProcessing]);

  if (!isProcessing && thoughtStream.length === 0) return null;

  return (
    <div className="my-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full max-w-3xl mx-auto">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-black text-white px-3 py-2 font-mono text-xs font-bold uppercase cursor-pointer hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center">
          <Terminal className="w-4 h-4 mr-2" />
          {agentName} // {isProcessing ? 'PROCESSING...' : 'IDLE'}
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
            <div className="animate-pulse">{`> _`}</div>
          )}
        </div>
      )}
    </div>
  );
}
