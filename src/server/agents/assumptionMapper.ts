import { AgentContext } from "./types";
import { chatCompletion } from "./helper";

export async function runAssumptionMapper(ctx: AgentContext, input: string) {
  ctx.sendEvent("reasoning", { agent: "Assumption Mapper", status: "Mapping assumptions and risks..." });

  const systemPrompt = `You are the Assumption Mapper. Break down the core idea into critical assumptions and risks.
Output strictly JSON:
{
  "assumptions": [
    { "text": "description", "confidence": "high|medium|low", "validationStatus": "pending" }
  ],
  "risks": [
    { "text": "description", "severity": "high|medium|low", "mitigation": "proposed mitigation" }
  ]
}`;

  const result = await chatCompletion(ctx, systemPrompt, `Idea: ${input}`, "Assumption Mapper", [], true);
  
  if (result) {
    ctx.plan.assumptions = result.assumptions || [];
    ctx.plan.risks = result.risks || [];
  }
  
  ctx.sendEvent("plan_update", { assumptions: ctx.plan.assumptions, risks: ctx.plan.risks });

  return { status: "researching", nextInput: input };
}
