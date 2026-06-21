import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Conversation, ChatMessage, WorkflowStage } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface WorkflowState {
  conversations: Conversation[];
  activeConversationId: string | null;
  createConversation: (initialMessage?: string) => string;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateStage: (conversationId: string, stage: WorkflowStage) => void;
  updateTitle: (conversationId: string, title: string) => void;
  deleteConversation: (conversationId: string) => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      
      createConversation: (initialMessage) => {
        const newConversation: Conversation = {
          id: uuidv4(),
          title: 'New Execution Track',
          stage: 'INTAKE',
          messages: [],
          updatedAt: Date.now(),
        };
        
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          activeConversationId: newConversation.id
        }));
        
        if (initialMessage) {
          get().addMessage(newConversation.id, {
            role: 'user',
            content: initialMessage
          });
        }
        
        return newConversation.id;
      },
      
      setActiveConversation: (id) => set({ activeConversationId: id }),
      
      addMessage: (conversationId, message) => {
        set((state) => ({
          conversations: state.conversations.map(conv => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages: [...conv.messages, { ...message, id: uuidv4(), timestamp: Date.now() }],
                updatedAt: Date.now()
              };
            }
            return conv;
          })
        }));
      },
      
      updateStage: (conversationId, stage) => {
        set((state) => ({
          conversations: state.conversations.map(conv => 
            conv.id === conversationId ? { ...conv, stage, updatedAt: Date.now() } : conv
          )
        }));
      },
      
      updateTitle: (conversationId, title) => {
         set((state) => ({
          conversations: state.conversations.map(conv => 
            conv.id === conversationId ? { ...conv, title, updatedAt: Date.now() } : conv
          )
        }));
      },
      
      deleteConversation: (conversationId) => {
        set((state) => {
          const newConversations = state.conversations.filter(c => c.id !== conversationId);
          return {
            conversations: newConversations,
            activeConversationId: state.activeConversationId === conversationId 
              ? (newConversations.length > 0 ? newConversations[0].id : null) 
              : state.activeConversationId
          };
        });
      }
    }),
    {
      name: 'mnemosyne-workflow',
    }
  )
);
