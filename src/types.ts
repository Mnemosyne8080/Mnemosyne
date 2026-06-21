export type WorkflowStage = 'INTAKE' | 'CLARIFY' | 'STRESS_TEST' | 'FINALIZE';

export interface AppSettings {
  baseUrl: string;
  apiKey: string;
  modelName: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  component?: 'ClarificationForm' | 'RiskMatrix' | 'ExecutionBoard';
  componentData?: any;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  stage: WorkflowStage;
  messages: ChatMessage[];
  updatedAt: number;
}
