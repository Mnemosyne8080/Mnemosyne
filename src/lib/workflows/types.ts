export type WorkflowType = 'research' | 'validate' | 'plan' | 'custom';
export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface WorkflowSubagent {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  result?: string;
  error?: string;
}

export interface WorkflowConfig {
  type: WorkflowType;
  fanOutCount: number;
  customPrompt?: string;
  researchAngles?: string[];
  assumptionIds?: string[];
  planStrategies?: string[];
}

export interface Workflow {
  id: string;
  title: string;
  status: WorkflowStatus;
  config: WorkflowConfig;
  subagents: WorkflowSubagent[];
  results: any;
  createdAt: string;
  updatedAt: string;
}
