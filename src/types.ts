export type WorkflowStage = 'INTAKE' | 'CLARIFY' | 'RESEARCH' | 'COMPILE' | 'FINALIZER';

export interface AppSettings {
  baseUrl: string;
  apiKey: string;
  modelName: string;
  email?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  component?: 'ClarificationForm' | 'RiskMatrix' | 'CompiledBrief' | 'ExecutionBoard';
  componentData?: any;
  timestamp: number;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  stage: WorkflowStage;
  messages: ChatMessage[];
  updatedAt: number;
}
