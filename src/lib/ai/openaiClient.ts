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
    CLARIFY: `You are the Inquisitor Subagent. You must halt generation and interview the user to clarify assumptions about their idea.
Generate 3-5 UNIQUE clarification questions tailored to the user's specific idea. Do NOT use generic placeholder questions — every question must be directly relevant to what the user described.
Output a JSON block wrapped in \`\`\`json representing a ClarificationForm.
Available question types:
- "text": short text input. { "id": "q1", "type": "text", "label": "Your question here" }
- "radio": single choice. { "id": "q2", "type": "radio", "label": "Your question", "options": ["Option A", "Option B", "Option C"] }
- "slider": numeric range. { "id": "q3", "type": "slider", "label": "Your question", "min": 0, "max": 100, "step": 10 }
- "textarea": multi-line text. { "id": "q4", "type": "textarea", "label": "Your question" }
- "boolean": yes/no. { "id": "q5", "type": "boolean", "label": "Your question" }
- "scale": 1-10 rating. { "id": "q6", "type": "scale", "label": "Your question", "min": 1, "max": 10 }

Rules:
- Use a mix of question types (not all text).
- Questions must be specific to the user's idea, not generic.
- For follow-up rounds, ask DIFFERENT questions that dig deeper based on previous answers.
- Include a short "context" field (1 sentence) explaining why you're asking, shown above the question.

Format:
{
  "component": "ClarificationForm",
  "data": {
    "questions": [
      { "id": "q1", "type": "textarea", "label": "What problem does this solve?", "context": "Understanding the core pain point helps scope the solution" },
      { "id": "q2", "type": "radio", "label": "Who is the primary user?", "options": ["Consumers", "Small businesses", "Enterprises", "Developers"] },
      { "id": "q3", "type": "slider", "label": "What is your budget (USD)?", "min": 0, "max": 50000, "step": 1000 },
      { "id": "q4", "type": "boolean", "label": "Do you have existing user research?" }
    ]
  }
}`,
    RESEARCH: `You are the Analyst Subagent. Generate a Risk Matrix based on the concept.
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
    COMPILE: `You are the Compiler Subagent. Your task is to gather ALL data from the entire conversation context — the original idea, the clarification responses, the risk assessment, and any decisions made — and compile it into a single structured JSON summary.
Output a JSON block wrapped in \`\`\`json.
Format:
{
  "component": "CompiledBrief",
  "data": {
    "idea": "A concise restatement of the core idea",
    "targetAudience": "Who this is for",
    "keyDifferentiators": ["point1", "point2"],
    "constraints": ["constraint1", "constraint2"],
    "userPreferences": { "key": "value from clarifications" },
    "risksAccepted": true,
    "researchSummary": "Summary of findings from research phase"
  }
}`,
    FINALIZER: `You are the Architect Subagent. Using the compiled brief and all prior context, create a comprehensive, actionable execution plan organized as a Kanban board.
Output a JSON block wrapped in \`\`\`json.
Format:
{
  "component": "ExecutionBoard",
  "data": {
    "columns": [
      {
        "id": "foundation",
        "title": "Phase 1 — Foundation",
        "tasks": [
          { "id": "f1", "desc": "Task description", "detail": "Specific actionable detail", "deliverable": "What to produce" }
        ]
      },
      {
        "id": "build",
        "title": "Phase 2 — Build",
        "tasks": [
          { "id": "b1", "desc": "Task description", "detail": "Specific actionable detail", "deliverable": "What to produce" }
        ]
      },
      {
        "id": "launch",
        "title": "Phase 3 — Launch",
        "tasks": [
          { "id": "l1", "desc": "Task description", "detail": "Specific actionable detail", "deliverable": "What to produce" }
        ]
      },
      {
        "id": "grow",
        "title": "Phase 4 — Grow",
        "tasks": [
          { "id": "g1", "desc": "Task description", "detail": "Specific actionable detail", "deliverable": "What to produce" }
        ]
      }
    ]
  }
}

Rules:
- Each phase should have 3-6 tasks minimum.
- Every task must have "desc" (short title), "detail" (1-2 sentences of specifics), and "deliverable" (tangible output).
- Tasks should be concrete and actionable, not vague.
- Tailor the plan to the user's specific idea, audience, constraints, and risk profile from earlier phases.
- Use the user's stated budget, timeline, and technical comfort level from clarifications.
- Scale the plan to the user's available time per week and target launch timeline — a 20+ hour/week plan looks very different from a 2-5 hour/week plan.
- Include tasks for: setup/infrastructure, core features, content/UX, testing, launch prep, and post-launch growth.
- Adjust phase durations and task granularity based on the timeline — shorter timelines need fewer, bigger tasks; longer timelines can be more granular.`
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
           component: parsed.component as 'ClarificationForm' | 'RiskMatrix' | 'CompiledBrief' | 'ExecutionBoard',
           componentData: parsed.data,
           jsonValid: true
        };
      }
      if (parsed.summary) {
        return {
          text: parsed.summary,
          component: undefined,
          componentData: undefined,
          jsonValid: true
        };
      }
      // JSON parsed but no recognized structure
      return {
        text: content.replace(jsonMatch[0], '').trim(),
        component: undefined,
        componentData: undefined,
        jsonValid: true
      };
    } catch(e) {
      // JSON block detected but malformed
      return {
        text: content,
        component: undefined,
        componentData: undefined,
        jsonValid: false,
        jsonBlock: jsonMatch[1]
      };
    }
  }
  return { text: content, component: undefined, componentData: undefined, jsonValid: true };
}
