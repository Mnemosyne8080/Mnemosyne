export const PLAN_SCHEMA = {
  idea: "",
  assumptions: [], // { text: string, confidence: "high" | "medium" | "low", validationStatus: string }
  risks: [], // { text: string, severity: "high" | "medium" | "low", mitigation: string }
  paths: [], // { name: string, pros: string[], cons: string[] }
  milestones: [], // { title: string, description: string }
  firstAction: "",
  decisionPoints: [], // { text: string, options: string[] }
  workspace: [], // { filename: string, content: string }
  sources: [], // { url: string, title: string }
};

export type AgentContext = {
  openai: any;
  model: string;
  messages: any[];
  sendEvent: (event: string, data: any) => void;
  toolsEnabled: any;
  plan: typeof PLAN_SCHEMA;
};
