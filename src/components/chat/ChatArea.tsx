import React, { useRef, useEffect, useState } from 'react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { StageVisualizer } from '../workflow/StageVisualizer';
import { AgentTerminal } from './AgentTerminal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import ReactMarkdown from 'react-markdown';
import { Send } from 'lucide-react';
import { ClarificationForm } from '../widgets/ClarificationForm';
import { RiskMatrix } from '../widgets/RiskMatrix';
import { ExecutionBoard } from '../widgets/ExecutionBoard';
import { CompiledBrief } from '../widgets/CompiledBrief';
import { callLLM, parseStructuredOutput } from '../../lib/ai/openaiClient';
import { WorkflowStage } from '../../types';

interface ChatAreaProps {
  onOpenSettings: () => void;
}

export function ChatArea({ onOpenSettings }: ChatAreaProps) {
  const {
    getUserConversations,
    activeConversationId,
    addMessage,
    updateStage,
    createConversation,
    updateTitle,
    userId
  } = useWorkflowStore();
  const { settings, isConfigured } = useSettingsStore();

  const [inputTimer, setInputTimer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [thoughtStream, setThoughtStream] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversations = getUserConversations();
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation?.messages, isProcessing, thoughtStream]);

  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 flex-col">
        <h2 className="font-mono text-xl font-bold uppercase tracking-widest text-gray-500 mb-4">No Active Execution Track</h2>
        <Button onClick={() => createConversation(userId || 'local')}>INITIALIZE NEW TRACK</Button>
      </div>
    );
  }

  const handleSend = async (text: string, isActionResp: boolean = false) => {
    if (!text.trim() && !isActionResp) return;
    if (!isConfigured()) {
      onOpenSettings();
      return;
    }

    if (!isActionResp) {
        addMessage(activeConversation.id, { role: 'user', content: text });
    }
    setInputTimer('');
    setIsProcessing(true);
    setThoughtStream(['[SYSTEM] Initializing LLM uplink...', `[SYSTEM] Contacting ${settings.modelName}...`]);

    try {
       // Refresh active conversation messages for call
       const currentMessages = useWorkflowStore.getState().conversations.find(c => c.id === activeConversation.id)?.messages || [];
       const currentStage = useWorkflowStore.getState().conversations.find(c => c.id === activeConversation.id)?.stage || 'INTAKE';

       const rawResponse = await callLLM(currentMessages, settings, currentStage);

       const { text: responseText, component, componentData, jsonValid } = parseStructuredOutput(rawResponse);

       if (jsonValid === false) {
         // JSON was detected but malformed — ask LLM to reformat
         setThoughtStream(prev => [...prev, '[SYSTEM] Malformed JSON detected, requesting reformat...']);
         const reformatted = await callLLM(
           [
             ...currentMessages,
             { id: 'bad-resp', role: 'assistant', content: rawResponse, timestamp: Date.now() },
             { id: 'fix-req', role: 'user', content: 'Your previous response contained malformed JSON. Please reformat your output as valid JSON wrapped in ```json fences. Do not include any text outside the JSON block.', timestamp: Date.now() + 1 }
           ],
           settings,
           currentStage
         );
         const retry = parseStructuredOutput(reformatted);
         addMessage(activeConversation.id, {
           role: 'assistant',
           content: retry.text || '[Structured Data Output]',
           component: retry.component,
           componentData: retry.componentData
         });
       } else {
         setThoughtStream(prev => [...prev, '[SYSTEM] Response parsed successfully.']);
         addMessage(activeConversation.id, {
           role: 'assistant',
           content: responseText || '[Structured Data Output]',
           component,
           componentData
         });
       }

       // Stage Advancement Logic based on agent output
       if (currentStage === 'INTAKE') {
           if (activeConversation.messages.length <= 1) {
             // Auto-rename chat using the LLM summary from INTAKE response
             const titleText = responseText || text.slice(0, 40);
             const cleanTitle = titleText.replace(/\*\*/g, '').replace(/\n/g, ' ').trim().slice(0, 50);
             updateTitle(activeConversation.id, cleanTitle);
           }
           updateStage(activeConversation.id, 'CLARIFY');
           handleSend('Please begin the clarification phase.', true);
       }

    } catch (e: any) {
        setThoughtStream(prev => [...prev, `[ERROR] ${e.message}`]);
        addMessage(activeConversation.id, { role: 'assistant', content: `**SYSTEM FAILURE:** ${e.message}` });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleClarificationSubmit = (responses: Record<string, any>) => {
    const formatted = Object.entries(responses)
      .map(([key, value]) => `**${key}:** ${value}`)
      .join(' | ');
    addMessage(activeConversation.id, {
      role: 'user',
      content: `Clarifications submitted — ${formatted}`
    });

    const clarifyMessages = activeConversation.messages.filter(
      m => m.component === 'ClarificationForm'
    ).length;

    if (clarifyMessages >= 2) {
      // Already had one follow-up round — move to RESEARCH
      updateStage(activeConversation.id, 'RESEARCH');
      handleSend('I have submitted the clarification form. That should be enough, please proceed to research.', true);
    } else {
      // Stay in CLARIFY for follow-up questions
      handleSend('I have submitted the clarification form. Please ask me any follow-up questions if needed, or let me know when to proceed.', true);
    }
  };

  const handleRiskDecision = (decision: string) => {
    const label = decision === 'ACCEPT_RISKS' ? 'Accepted risks — proceeding to compile' : 'Pivoting strategy based on risks';
    addMessage(activeConversation.id, {
      role: 'user',
      content: `**Decision:** ${label}`
    });
    if (decision === 'ACCEPT_RISKS') {
        updateStage(activeConversation.id, 'COMPILE');
        handleSend('I have accepted the risks. Please compile the project brief.', true);
    } else {
        // Pivot
        handleSend('I want to pivot the strategy based on these risks. Ask me what we should change.', true);
    }
  };

  const handleCompileAccept = () => {
    updateStage(activeConversation.id, 'FINALIZER');
    handleSend('The compiled brief looks good. Please create the execution plan.', true);
  };

  const getAgentName = () => {
    switch (activeConversation.stage) {
      case 'INTAKE': return 'COORDINATOR';
      case 'CLARIFY': return 'INQUISITOR';
      case 'RESEARCH': return 'ANALYST';
      case 'COMPILE': return 'COMPILER';
      case 'FINALIZER': return 'ARCHITECT';
      default: return 'SYSTEM';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <StageVisualizer currentStage={activeConversation.stage} />
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6"
      >
        {activeConversation.messages.map((message) => (
          <div 
            key={message.id} 
            className={`max-w-4xl ${message.role === 'user' ? 'ml-auto' : 'mr-auto'} `}
          >
            {message.role !== 'user' && (
              <div className="font-mono text-xs font-bold uppercase mb-1 text-gray-500">
                [AGENT://{getAgentName()}]
              </div>
            )}
            
            <div className={`p-4 font-mono text-sm border-2 border-black ${
                message.role === 'user' 
                ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]' 
                : 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
            }`}>
              <div className="prose prose-sm max-w-none prose-p:my-2">
                <ReactMarkdown>
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>

            {message.component === 'ClarificationForm' && (
              <ClarificationForm
                data={message.componentData}
                isSubmitted={activeConversation.messages.findIndex(m => m.id === message.id) !== activeConversation.messages.length - 1}
                onSubmit={handleClarificationSubmit}
                onSkip={() => {
                  updateStage(activeConversation.id, 'RESEARCH');
                  handleSend('I have submitted the clarification form. That should be enough, please proceed to research.', true);
                }}
              />
            )}
            {message.component === 'RiskMatrix' && (
              <RiskMatrix 
                data={message.componentData} 
                onHumanDecision={handleRiskDecision}
                decisionMade={activeConversation.messages.findIndex(m => m.id === message.id) !== activeConversation.messages.length - 1} 
              />
            )}
            {message.component === 'CompiledBrief' && (
              <CompiledBrief
                data={message.componentData}
                onAccept={handleCompileAccept}
                isAccepted={activeConversation.messages.findIndex(m => m.id === message.id) !== activeConversation.messages.length - 1}
              />
            )}
            {message.component === 'ExecutionBoard' && (
              <ExecutionBoard data={message.componentData} />
            )}
          </div>
        ))}
        
        <AgentTerminal 
          agentName={getAgentName()}
          isProcessing={isProcessing} 
          thoughtStream={thoughtStream} 
        />
      </div>

      <div className="border-t-4 border-black p-4 bg-gray-100">
        <form 
          className="flex space-x-2 max-w-4xl mx-auto"
          onSubmit={(e) => { e.preventDefault(); handleSend(inputTimer); }}
        >
          <Input 
            value={inputTimer}
            onChange={(e) => setInputTimer(e.target.value)}
            disabled={isProcessing}
            placeholder={
                !isConfigured() ? 'PLEASE CONFIGURE SYSTEM SETTINGS (BYOK) FIRST...' : 
                activeConversation.stage === 'CLARIFY' ? 'Waiting for form submission...' :
                'TYPE YOUR COMMAND OR INPUT HERE...'
            }
            className="flex-1 shadow-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          />
          <Button 
            type="submit" 
            disabled={isProcessing || !isConfigured()}
            className="w-12 px-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
