import { Response } from 'express';
import type OpenAI from 'openai';
import { supabaseAdmin } from '../../lib/supabase/server';
import type { Workflow, WorkflowSubagent, WorkflowConfig } from '../../lib/workflows/types';

const abortControllers = new Map<string, AbortController>();

function sendEvent(res: Response, event: string, data: any) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function createSubagents(config: WorkflowConfig, count: number): WorkflowSubagent[] {
  const agents: WorkflowSubagent[] = [];
  for (let i = 0; i < count; i++) {
    let label = `Subagent ${i + 1}`;
    if (config.type === 'research' && config.researchAngles?.[i]) {
      label = `Research: ${config.researchAngles[i]}`;
    } else if (config.type === 'plan' && config.planStrategies?.[i]) {
      label = `Plan: ${config.planStrategies[i]}`;
    }
    agents.push({
      id: `sa-${i}-${Date.now()}`,
      label,
      status: 'pending',
      progress: 0,
    });
  }
  return agents;
}

async function runSubagent(
  openai: OpenAI,
  model: string,
  agent: WorkflowSubagent,
  config: WorkflowConfig,
  context: { idea?: string; plan?: any; messages?: any[] },
  onProgress: (progress: number, partial?: string) => void
): Promise<string> {
  const systemPrompts: Record<string, string> = {
    research: `You are a Research subagent. Your job is to research the given angle/topic thoroughly. Provide a comprehensive research summary with key findings, data points, and sources.`,
    validate: `You are a Validation subagent. Your job is to critically evaluate the given assumption. Assess its validity, provide evidence for/against, and rate confidence as high/medium/low.`,
    plan: `You are a Planning subagent. Your job is to create an actionable execution plan following the specified strategy. Include milestones, risks, and first steps.`,
    custom: `You are a specialized subagent. Follow the user's instructions carefully and provide a thorough response.`,
  };

  const angle = config.researchAngles ? ` Research angle: ${config.researchAngles[parseInt(agent.id.split('-')[2]) % config.researchAngles.length]}.` : '';
  const strategy = config.planStrategies ? ` Planning strategy: ${config.planStrategies[parseInt(agent.id.split('-')[2]) % config.planStrategies.length]}.` : '';
  const custom = config.customPrompt ? ` Instructions: ${config.customPrompt}` : '';

  const userMessage = `Context: Idea: ${context.idea || 'N/A'}\nPlan: ${JSON.stringify(context.plan || {})}\n${angle}${strategy}${custom}\n\nPlease provide your analysis.`;

  onProgress(30);

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system' as const, content: systemPrompts[config.type] + '\nBe thorough but concise. Output in structured markdown.' },
      ...(context.messages || []).slice(-6).map((m: any) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: userMessage },
    ],
    max_tokens: 2000,
  });

  onProgress(90);

  const content = response.choices[0]?.message?.content || 'No response generated.';
  onProgress(100);
  return content;
}

export async function executeWorkflow(
  workflow: Workflow,
  openai: OpenAI,
  model: string,
  context: { idea?: string; plan?: any; messages?: any[]; userId: string; conversationId?: string },
  res: Response
) {
  const controller = new AbortController();
  abortControllers.set(workflow.id, controller);

  // Create subagents if not already created
  let subagents = workflow.subagents;
  if (!subagents || subagents.length === 0) {
    subagents = createSubagents(workflow.config, workflow.config.fanOutCount);
  }

  // Update workflow to running
  await supabaseAdmin.from('workflows').update({
    status: 'running',
    subagents,
    updated_at: new Date().toISOString(),
  }).eq('id', workflow.id);

  sendEvent(res, 'workflow_created', { workflow: { ...workflow, subagents, status: 'running' } });

  const results: Record<string, string> = {};
  const tasks = subagents.map(async (agent, index) => {
    if (controller.signal.aborted) {
      agent.status = 'failed';
      agent.error = 'Cancelled';
      return;
    }

    agent.status = 'running';
    sendEvent(res, 'workflow_subagent_start', { workflowId: workflow.id, subagentId: agent.id, label: agent.label });

    try {
      const result = await runSubagent(
        openai,
        model,
        agent,
        workflow.config,
        context,
        (progress) => {
          agent.progress = progress;
          sendEvent(res, 'workflow_subagent_progress', { workflowId: workflow.id, subagentId: agent.id, progress });
        }
      );
      agent.status = 'completed';
      agent.progress = 100;
      agent.result = result;
      results[agent.id] = result;
      sendEvent(res, 'workflow_subagent_complete', { workflowId: workflow.id, subagentId: agent.id, result });
    } catch (err: any) {
      agent.status = 'failed';
      agent.error = err.message || 'Unknown error';
      agent.progress = 0;
      sendEvent(res, 'workflow_error', { workflowId: workflow.id, subagentId: agent.id, error: agent.error });
    }
  });

  await Promise.allSettled(tasks);

  // Determine final status
  const allFailed = subagents.every((sa) => sa.status === 'failed');
  const anyFailed = subagents.some((sa) => sa.status === 'failed');
  const finalStatus = controller.signal.aborted
    ? 'cancelled'
    : allFailed
      ? 'failed'
      : anyFailed
        ? 'completed'
        : 'completed';

  // Update workflow in DB
  await supabaseAdmin.from('workflows').update({
    status: finalStatus,
    subagents,
    results,
    updated_at: new Date().toISOString(),
  }).eq('id', workflow.id);

  sendEvent(res, 'workflow_complete', { workflowId: workflow.id, results });
  abortControllers.delete(workflow.id);
}

export function cancelWorkflow(id: string) {
  const controller = abortControllers.get(id);
  if (controller) {
    controller.abort();
    abortControllers.delete(id);
  }
}
