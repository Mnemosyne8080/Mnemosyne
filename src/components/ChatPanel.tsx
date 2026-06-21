import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import { Settings as SettingsIcon, Send, Terminal, Key } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export function ChatPanel({ openSettings }: { openSettings: () => void }) {
  const { messages, addMessage, baseUrl, modelName, apiKey, toolsEnabled, isProcessing, setProcessing, clearChat, updatePlan, plan, triggerExport } = useAppStore();
  const [input, setInput] = useState('');
  const [reasoning, setReasoning] = useState<{agent: string, status: string} | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, reasoning]);

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    const finalInput = overrideInput !== undefined ? overrideInput : input.trim();
    if (!finalInput || isProcessing) return;

    if (!apiKey) {
      alert("Please configure your API key in settings first.");
      openSettings();
      return;
    }

    const userMsg = { id: uuidv4(), role: 'user' as const, content: finalInput, timestamp: Date.now() };
    addMessage(userMsg);
    setInput('');
    setProcessing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          baseUrl,
          model: modelName,
          apiKey,
          toolsEnabled,
          currentPlan: plan
        })
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() || "";

        for (const chunk of chunks) {
          if (chunk.startsWith('event: ')) {
            const lines = chunk.split('\n');
            const eventType = lines[0].replace('event: ', '');
            const dataStr = lines[1].replace('data: ', '');
            let data;
            try { data = JSON.parse(dataStr); } catch(e) { continue; }

            if (eventType === 'reasoning') {
              setReasoning({ agent: data.agent, status: data.status });
            } else if (eventType === 'text') {
              addMessage({
                id: uuidv4(),
                role: 'assistant',
                content: data.text,
                agent: data.agent,
                timestamp: Date.now(),
                options: data.options
              });
              setReasoning(null);
            } else if (eventType === 'plan_update') {
              updatePlan(data);
            } else if (eventType === 'done') {
              setReasoning(null);
            } else if (eventType === 'export_pdf') {
              triggerExport();
            } else if (eventType === 'error') {
              addMessage({
                id: uuidv4(),
                role: 'assistant',
                content: `Error: ${data.message}`,
                agent: 'System',
                timestamp: Date.now()
              });
              setReasoning(null);
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      addMessage({
         id: uuidv4(),
         role: 'assistant',
         content: `Failed to connect or process: ${err.message}`,
         agent: 'System',
         timestamp: Date.now()
      });
      setReasoning(null);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b-4 border-black flex justify-between items-center shrink-0">
         <h1 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
           <div className="w-8 h-8 bg-black text-white flex items-center justify-center -rotate-6">
             Mn
           </div>
           Mnemosyne
         </h1>
         <div className="flex gap-2">
           <button onClick={clearChat} className="p-2 border-2 border-transparent hover:border-black transition-colors tooltip" aria-label="Clear context">
             <Terminal className="w-5 h-5" />
           </button>
           <button onClick={openSettings} className="p-2 border-2 border-transparent hover:border-black transition-colors relative">
             <SettingsIcon className="w-5 h-5" />
             {!apiKey && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />}
           </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
            <h2 className="text-xl font-bold uppercase tracking-widest mb-4">Start the process</h2>
            <p className="font-mono text-sm max-w-sm mb-8">
              Describe your idea, project, or goal. The multi-agent system will break it down, validate assumptions, and build an execution plan.
            </p>
            <div className="p-4 border-2 border-black border-dashed flex items-center gap-4 bg-gray-50">
               <Key className="w-6 h-6" />
               <div className="text-left font-mono text-xs">
                 Requires your own API Key configured.<br/>
                 Settings {'>'} API Key
               </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
             <div className="flex items-end gap-2 max-w-[85%]">
               {msg.role === 'assistant' && (
                 <div className="w-8 h-8 shrink-0 border-2 border-black bg-black text-white flex items-center justify-center text-[10px] font-bold uppercase overflow-hidden">
                   {msg.agent?.substring(0,2) || 'MN'}
                 </div>
               )}
               <div className={`
                 p-4 border-2 border-black
                 ${msg.role === 'user' ? 'bg-black text-white' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}
               `}>
                 <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 opacity-50`}>
                   {msg.role === 'user' ? 'You' : msg.agent}
                 </div>
                 <div className="font-mono text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                 
                 {msg.options && msg.options.length > 0 && (
                   <div className="flex flex-col gap-2 mt-4">
                     {msg.options.map((opt, i) => (
                       <button
                         key={i}
                         onClick={() => handleSubmit(undefined, opt)}
                         disabled={isProcessing}
                         className="text-left font-mono text-xs p-2 border-2 border-black hover:bg-black hover:text-white transition-colors disabled:opacity-50 break-words"
                       >
                         {opt}
                       </button>
                     ))}
                   </div>
                 )}
               </div>
             </div>
          </div>
        ))}

        {reasoning && (
          <div className="flex items-start gap-2 max-w-[80%] opacity-70">
            <div className="w-8 h-8 shrink-0 border-2 border-black bg-gray-200 flex items-center justify-center text-[10px] font-bold">
               ...
            </div>
            <div className="p-3 border-2 border-black border-dashed bg-gray-50">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-gray-500">
                {reasoning.agent}
              </div>
              <div className="font-mono text-xs flex items-center gap-2">
                 <span className="w-2 h-2 bg-black block animate-pulse" />
                 {reasoning.status}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t-4 border-black bg-white shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your idea..."
            className="input-brutal flex-1 w-full text-lg p-4"
            disabled={isProcessing}
          />
          <button type="submit" disabled={isProcessing} className="btn-brutal bg-black text-white px-6 border-black disabled:opacity-50 flex items-center justify-center">
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
}
