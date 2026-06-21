import { AgentContext } from "./types";
import { chatCompletion } from "./helper";

export async function runClarifier(ctx: AgentContext, input: string) {
  ctx.sendEvent("reasoning", { agent: "Clarifier", status: "Analyzing intent..." });

  const systemPrompt = `You are the Clarifier. Your job is to read the user's idea and extract the core concept into a structured JSON format. IF the idea is too vague to even start an assumption map, provide a "clarifyingQuestion" and optional "options" (e.g. up to 4 suggested interactive answers). Otherwise, output the parsed idea.
Output strictly JSON:
{
  "isVague": boolean,
  "clarifyingQuestion": "string or null",
  "options": ["Option 1", "Option 2"],
  "coreIdea": "string or null"
}`;

  const result = await chatCompletion(ctx, systemPrompt, input, "Clarifier", [], true);
  
  if (result && result.isVague && result.clarifyingQuestion) {
    ctx.sendEvent("text", { text: result.clarifyingQuestion, agent: "Clarifier", options: result.options });
    return { status: "done" }; // Stop and wait for user reply (which will route back to clarifier)
  }

  const idea = result ? result.coreIdea : input;
  ctx.plan.idea = idea || input;
  ctx.sendEvent("plan_update", { idea: ctx.plan.idea });

  return { status: "mapping_assumptions", nextInput: idea };
}
