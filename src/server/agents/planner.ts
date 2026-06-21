import { AgentContext } from "./types";
import { chatCompletion } from "./helper";

export async function runPlanner(ctx: AgentContext, input: string) {
  ctx.sendEvent("reasoning", { agent: "Planner", status: "Structuring the execution roadmap..." });

  const systemPrompt = `You are the Planner. Based on the idea, assumptions, risks, and the user's latest input, build or update an actionable plan.
Output strictly JSON:
{
  "paths": [
    { "name": "path name", "pros": ["pro1"], "cons": ["con1"] }
  ],
  "milestones": [
    { "title": "Milestone 1", "description": "Details" }
  ],
  "firstAction": "The very first concrete step.",
  "decisionPoints": [
    { "text": "Crucial decision", "options": ["Option A", "Option B"] }
  ],
  "messageToUser": "A brief message explaining the plan to the user. Make it contextual to what they just asked.",
  "options": ["Suggest a change", "Looks good, export PDF"]
}`;

  const requestText = `Idea: ${input}
Assumptions: ${JSON.stringify(ctx.plan.assumptions)}
Risks: ${JSON.stringify(ctx.plan.risks)}
`;

  const result = await chatCompletion(ctx, systemPrompt, requestText, "Planner", [], true);

  if (result) {
    ctx.plan.paths = result.paths || [];
    ctx.plan.milestones = result.milestones || [];
    ctx.plan.firstAction = result.firstAction || "";
    ctx.plan.decisionPoints = result.decisionPoints || [];

    ctx.sendEvent("plan_update", {
      paths: ctx.plan.paths,
      milestones: ctx.plan.milestones,
      firstAction: ctx.plan.firstAction,
      decisionPoints: ctx.plan.decisionPoints
    });

    if (result.messageToUser) {
      ctx.sendEvent("text", { text: result.messageToUser, agent: "Planner", options: result.options });
    }
  } else {
      ctx.sendEvent("text", { text: "I have generated the plan structure for you.", agent: "Planner" });
  }

  return { status: "done" };
}
