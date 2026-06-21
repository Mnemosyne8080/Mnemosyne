import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Conversation, Message as DbMessage, Plan as DbPlan, Workflow as DbWorkflow } from './lib/supabase/services';
import * as services from './lib/supabase/services';
import type { Workflow, WorkflowConfig } from './lib/workflows/types';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
  timestamp: number;
  options?: string[];
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

export interface User {
  id: string;
  email: string;
  avatar_url?: string;
  full_name?: string;
  user_metadata?: any;
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;

  // API Config
  baseUrl: string;
  modelName: string;
  apiKey: string;

  // Chat
  messages: Message[];
  plan: Plan;
  isProcessing: boolean;
  exportTrigger: number;

  // Conversations
  currentConversationId: string | null;
  conversations: Conversation[];

  // Plan view
  planView: 'roadmap' | 'graph';

  // Workflows
  workflows: Workflow[];

  // Actions
  setUser: (user: User | null) => void;
  setBaseUrl: (url: string) => void;
  setModelName: (name: string) => void;
  setApiKey: (key: string) => void;
  addMessage: (msg: Message) => void;
  updatePlan: (partialPlan: Partial<Plan>) => void;
  updatePlanField: (field: keyof Plan, value: any) => void;
  addPlanItem: (section: string, item: any) => void;
  removePlanItem: (section: string, index: number) => void;
  reorderMilestones: (from: number, to: number) => void;
  setProcessing: (status: boolean) => void;
  clearChat: () => void;
  triggerExport: () => void;

  // Conversation actions
  setCurrentConversationId: (id: string | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  loadConversation: (id: string) => Promise<void>;
  createNewConversation: () => Promise<string | null>;
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<void>;
  branchConversation: (fromMessageId: string, newTitle?: string) => Promise<string | null>;

  // Plan view
  setPlanView: (view: 'roadmap' | 'graph') => void;

  // Workflow actions
  setWorkflows: (workflows: Workflow[]) => void;
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (id: string, data: Partial<Workflow>) => void;
  startWorkflow: (config: WorkflowConfig) => Promise<void>;

  // Logout
  logout: () => void;
}

const emptyPlan: Plan = {
  idea: '',
  assumptions: [],
  risks: [],
  paths: [],
  milestones: [],
  firstAction: '',
  decisionPoints: [],
  workspace: [],
  sources: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      isAuthenticated: false,

      // API Config
      baseUrl: 'https://api.openai.com/v1',
      modelName: 'gpt-4o',
      apiKey: '',

      // Chat
      messages: [],
      plan: { ...emptyPlan },
      isProcessing: false,
      exportTrigger: 0,

      // Conversations
      currentConversationId: null,
      conversations: [],

      // Plan view
      planView: 'roadmap',

      // Workflows
      workflows: [],

      // ─── Auth ───────────────────────────────────────────────────────────
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          messages: [],
          plan: { ...emptyPlan },
          currentConversationId: null,
          conversations: [],
          workflows: [],
        });
      },

      // ─── API Config ─────────────────────────────────────────────────────
      setBaseUrl: (url) => set({ baseUrl: url }),
      setModelName: (name) => set({ modelName: name }),
      setApiKey: (key) => set({ apiKey: key }),

      // ─── Chat ───────────────────────────────────────────────────────────
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      updatePlan: (partialPlan) =>
        set((state) => ({ plan: { ...state.plan, ...partialPlan } })),
      updatePlanField: (field, value) =>
        set((state) => ({ plan: { ...state.plan, [field]: value } })),
      addPlanItem: (section, item) =>
        set((state) => ({
          plan: {
            ...state.plan,
            [section]: [...(state.plan[section as keyof Plan] as any[]), item],
          },
        })),
      removePlanItem: (section, index) =>
        set((state) => {
          const arr = [...(state.plan[section as keyof Plan] as any[])];
          arr.splice(index, 1);
          return { plan: { ...state.plan, [section]: arr } };
        }),
      reorderMilestones: (from, to) =>
        set((state) => {
          const ms = [...(state.plan.milestones || [])];
          const [moved] = ms.splice(from, 1);
          ms.splice(to, 0, moved);
          return { plan: { ...state.plan, milestones: ms } };
        }),
      setProcessing: (status) => set({ isProcessing: status }),
      clearChat: () =>
        set({
          messages: [],
          plan: { ...emptyPlan },
          currentConversationId: null,
        }),
      triggerExport: () => set((state) => ({ exportTrigger: state.exportTrigger + 1 })),

      // ─── Conversations ─────────────────────────────────────────────────
      setCurrentConversationId: (id) => set({ currentConversationId: id }),
      setConversations: (conversations) => set({ conversations }),

      loadConversation: async (id) => {
        try {
          const dbMessages = await services.getMessages(id);
          const messages: Message[] = dbMessages.map((m) => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            agent: m.agent,
            timestamp: new Date(m.timestamp).getTime(),
            options: m.options,
          }));
          set({ messages });

          // Also load plan for this conversation
          const dbPlan = await services.getPlan(id);
          if (dbPlan?.plan_data && Object.keys(dbPlan.plan_data).length > 0) {
            set((state) => ({
              plan: { ...state.plan, ...dbPlan.plan_data },
            }));
          }
        } catch (err) {
          console.error('Failed to load conversation:', err);
        }
      },

      createNewConversation: async () => {
        const user = get().user;
        if (!user) return null;
        try {
          const conv = await services.createConversation(user.id);
          set((state) => ({
            conversations: [conv, ...state.conversations],
            currentConversationId: conv.id,
            messages: [],
            plan: { ...emptyPlan },
          }));
          return conv.id;
        } catch (err) {
          console.error('Failed to create conversation:', err);
          return null;
        }
      },

      deleteConversation: async (id) => {
        try {
          await services.deleteConversation(id);
          set((state) => ({
            conversations: state.conversations.filter((c) => c.id !== id),
            currentConversationId:
              state.currentConversationId === id ? null : state.currentConversationId,
          }));
        } catch (err) {
          console.error('Failed to delete conversation:', err);
        }
      },

      renameConversation: async (id, title) => {
        try {
          await services.updateConversation(id, { title });
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === id ? { ...c, title } : c
            ),
          }));
        } catch (err) {
          console.error('Failed to rename conversation:', err);
        }
      },

      branchConversation: async (fromMessageId, newTitle) => {
        const user = get().user;
        const currentConvId = get().currentConversationId;
        if (!user || !currentConvId) return null;

        try {
          // Find the index of the fromMessage
          const messages = get().messages;
          const fromIndex = messages.findIndex((m) => m.id === fromMessageId);
          if (fromIndex < 0) return null;

          const messagesToCopy = messages.slice(0, fromIndex + 1);

          // Create new conversation with parent
          const newConv = await services.createConversation(
            user.id,
            newTitle || 'Branch',
            currentConvId
          );

          // Copy messages
          for (const msg of messagesToCopy) {
            await services.addMessage({
              conversationId: newConv.id,
              role: msg.role,
              content: msg.content,
              agent: msg.agent,
              options: msg.options,
            });
          }

          // Copy plan
          const plan = get().plan;
          if (plan && (plan.idea || plan.milestones?.length)) {
            await services.upsertPlan(newConv.id, user.id, plan);
          }

          set((state) => ({
            conversations: [newConv, ...state.conversations],
            currentConversationId: newConv.id,
            messages: messagesToCopy,
          }));

          return newConv.id;
        } catch (err) {
          console.error('Failed to branch conversation:', err);
          return null;
        }
      },

      // ─── Plan view ──────────────────────────────────────────────────────
      setPlanView: (view) => {
        localStorage.setItem('planView', view);
        set({ planView: view });
      },

      // ─── Workflows ──────────────────────────────────────────────────────
      setWorkflows: (workflows) => set({ workflows }),
      addWorkflow: (workflow) =>
        set((state) => ({ workflows: [workflow, ...state.workflows] })),
      updateWorkflow: (id, data) =>
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === id ? { ...w, ...data } : w
          ),
        })),

      startWorkflow: async (config: WorkflowConfig) => {
        const user = get().user;
        const currentConversationId = get().currentConversationId;
        if (!user) return;

        try {
          // Create workflow in DB
          const dbWf = await services.createWorkflow(user.id, currentConversationId, config);
          const workflow: Workflow = {
            id: dbWf.id,
            title: `${config.type.charAt(0).toUpperCase() + config.type.slice(1)} Workflow`,
            status: 'pending',
            config,
            subagents: [],
            results: {},
            createdAt: dbWf.created_at,
            updatedAt: dbWf.updated_at,
          };
          get().addWorkflow(workflow);

          // Start the workflow via SSE
          const apiUrl = get().baseUrl;
          const apiKey = get().apiKey;
          const model = get().modelName;

          const response = await fetch('/api/workflows/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workflowId: workflow.id,
              baseUrl: apiUrl,
              model,
              apiKey,
              config,
              context: {
                idea: get().plan.idea,
                plan: get().plan,
                messages: get().messages,
              },
              credentials: 'include',
            }),
          });

          const reader = response.body?.getReader();
          if (!reader) return;

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const chunks = buffer.split('\n\n');
            buffer = chunks.pop() || '';

            for (const chunk of chunks) {
              if (!chunk.startsWith('event: ')) continue;
              const lines = chunk.split('\n');
              const eventType = lines[0].replace('event: ', '');
              const dataStr = lines[1]?.replace('data: ', '');
              if (!dataStr) continue;
              let data;
              try {
                data = JSON.parse(dataStr);
              } catch {
                continue;
              }

              if (eventType === 'workflow_subagent_start') {
                get().updateWorkflow(data.workflowId, {
                  status: 'running',
                });
              } else if (eventType === 'workflow_subagent_complete') {
                // Update subagent result
                const wf = get().workflows.find((w) => w.id === data.workflowId);
                if (wf) {
                  const updatedSubagents = (wf.subagents || []).map((sa) =>
                    sa.id === data.subagentId ? { ...sa, status: 'completed' as const, result: data.result } : sa
                  );
                  get().updateWorkflow(data.workflowId, { subagents: updatedSubagents });
                }
              } else if (eventType === 'workflow_complete') {
                get().updateWorkflow(data.workflowId, {
                  status: 'completed',
                  results: data.results,
                });
              } else if (eventType === 'workflow_error') {
                const wf = get().workflows.find((w) => w.id === data.workflowId);
                if (wf && !data.subagentId) {
                  get().updateWorkflow(data.workflowId, { status: 'failed' });
                }
              }
            }
          }
        } catch (err) {
          console.error('Failed to start workflow:', err);
        }
      },
    }),
    {
      name: 'mnemosyne-storage',
      partialize: (state) => ({
        baseUrl: state.baseUrl,
        modelName: state.modelName,
        apiKey: state.apiKey,
        messages: state.messages,
        plan: state.plan,
        user: state.user,
        currentConversationId: state.currentConversationId,
        planView: state.planView,
      }),
    }
  )
);
