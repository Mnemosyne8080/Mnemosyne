import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agent?: string; // The specific agent that replied
  timestamp: number;
  options?: string[]; // Interactive response options
}

export interface Plan {
  idea: string;
  assumptions: any[];
  risks: any[];
  paths: any[];
  milestones: any[];
  firstAction: string;
  decisionPoints: any[];
  workspace: any[];
  sources: any[];
}

interface AppState {
  baseUrl: string;
  modelName: string;
  apiKey: string;
  toolsEnabled: {
    web_search: boolean;
    calculator: boolean;
    map_location: boolean;
    job_market: boolean;
    news_trends: boolean;
    academic: boolean;
    workspace: boolean;
  };
  messages: Message[];
  plan: Plan;
  isProcessing: boolean;
  exportTrigger: number;
  
  setBaseUrl: (url: string) => void;
  setModelName: (name: string) => void;
  setApiKey: (key: string) => void;
  toggleTool: (tool: keyof AppState['toolsEnabled']) => void;
  addMessage: (msg: Message) => void;
  updatePlan: (partialPlan: Partial<Plan>) => void;
  setProcessing: (status: boolean) => void;
  clearChat: () => void;
  triggerExport: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      baseUrl: 'https://api.openai.com/v1',
      modelName: 'gpt-4o',
      apiKey: '',
      toolsEnabled: {
        web_search: true,
        calculator: true,
        map_location: true,
        job_market: true,
        news_trends: true,
        academic: true,
        workspace: true,
      },
      messages: [],
      plan: {
        idea: '',
        assumptions: [],
        risks: [],
        paths: [],
        milestones: [],
        firstAction: '',
        decisionPoints: [],
        workspace: [],
        sources: [],
      },
      isProcessing: false,
      exportTrigger: 0,
      
      setBaseUrl: (url) => set({ baseUrl: url }),
      setModelName: (name) => set({ modelName: name }),
      setApiKey: (key) => set({ apiKey: key }),
      toggleTool: (tool) => set((state) => ({
        toolsEnabled: { ...state.toolsEnabled, [tool]: !state.toolsEnabled[tool] }
      })),
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      updatePlan: (partialPlan) => set((state) => ({ 
        plan: { ...state.plan, ...partialPlan } 
      })),
      setProcessing: (status) => set({ isProcessing: status }),
      clearChat: () => set({ messages: [], plan: { idea: '', assumptions: [], risks: [], paths: [], milestones: [], firstAction: '', decisionPoints: [], workspace: [], sources: [] } }),
      triggerExport: () => set((state) => ({ exportTrigger: state.exportTrigger + 1 })),
    }),
    {
      name: 'mnemosyne-storage',
      partialize: (state) => ({ 
        baseUrl: state.baseUrl, 
        modelName: state.modelName, 
        apiKey: state.apiKey, 
        toolsEnabled: state.toolsEnabled,
        messages: state.messages,
        plan: state.plan
      }),
    }
  )
);
