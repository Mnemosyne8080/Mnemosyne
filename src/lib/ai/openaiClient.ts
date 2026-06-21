import { AppSettings, ChatMessage, WorkflowStage } from '../../types';

export const callLLM = async (
  messages: ChatMessage[],
  settings: AppSettings,
  stage: WorkflowStage
): Promise<string> => {
  if (!settings.apiKey) {
    throw new Error('API Key is missing. Configure BYOK in SYSTEM CONFIG.');
  }

  const systemPrompts: Record<WorkflowStage, string> = {
    INTAKE: `You are the Coordinator Agent. Your task is to take the user's ambiguous initial idea and structure it. Acknowledge their idea and then output a JSON block wrapped in \`\`\`json containing "next_stage": "CLARIFY" and a brief summary. Do not output anything else besides this summary.`,
    CLARIFY: `You are the Inquisitor Subagent. You must halt generation and interview the user to clarify assumptions.
Output a JSON block wrapped in \`\`\`json representing a ClarificationForm.
Format:
{
  "component": "ClarificationForm",
  "data": {
    "questions": [
      { "id": "q1", "type": "text", "label": "What is the primary unfair advantage?" },
      { "id": "q2", "type": "radio", "label": "Technical Comfort Level", "options": ["Low", "Medium", "High"] },
      { "id": "q3", "type": "slider", "label": "Budget Scope ($)", "min": 0, "max": 10000 }
    ]
  }
}`,
    STRESS_TEST: `You are the Analyst Subagent. Generate a Risk Matrix based on the concept.
Output a JSON block wrapped in \`\`\`json.
Format:
{
  "component": "RiskMatrix",
  "data": {
    "confidenceIndex": 85,
    "risks": [
      { "name": "Market saturation", "impact": "High", "likelihood": "High", "mitigation": "Niche positioning" },
      { "name": "Technical complexity", "impact": "High", "likelihood": "Low", "mitigation": "Use off-the-shelf tools" },
      { "name": "User acquisition", "impact": "Medium", "likelihood": "High", "mitigation": "Content marketing" }
    ]
  }
}`,
    FINALIZE: `You are the Architect Subagent. Create a Kanban Execution Board.
Output a JSON block wrapped in \`\`\`json.
Format:
{
  "component": "ExecutionBoard",
  "data": {
    "columns": [
      {
        "id": "30", "title": "Days 1-30",
        "tasks": [{ "id": "t1", "desc": "Market validation" }, { "id": "t2", "desc": "Domain registration" }]
      },
      {
        "id": "60", "title": "Days 31-60",
        "tasks": [{ "id": "t3", "desc": "MVP Development" }]
      },
      {
        "id": "90", "title": "Days 61-90",
        "tasks": [{ "id": "t4", "desc": "Soft launch" }]
      }
    ]
  }
}`
  };

  const formattedMessages = [
    { role: 'system', content: systemPrompts[stage] },
    ...messages.map(m => ({ 
      role: m.role as 'user' | 'assistant' | 'system', 
      content: m.content 
    }))
  ];

  try {
    const response = await fetch(`${settings.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.modelName,
        messages: formattedMessages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('LLM Error:', error);
    throw new Error(error.message || 'Failed to communicate with LLM endpoint.');
  }
};

export const parseStructuredOutput = (content: string) => {
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.component) {
        return {
           text: content.replace(jsonMatch[0], '').trim(),
           component: parsed.component as 'ClarificationForm' | 'RiskMatrix' | 'ExecutionBoard',
           componentData: parsed.data
        };
      }
    } catch(e) {}
  }
  return { text: content, component: undefined, componentData: undefined };
}
