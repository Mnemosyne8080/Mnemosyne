import { AgentContext } from "./types";
import { chatCompletion } from "./helper";

export async function runRouter(ctx: AgentContext, currentInput: string) {
  ctx.sendEvent("reasoning", { agent: "Coordinator", status: "Analyzing intent..." });

  const systemPrompt = `You are the Main Coordinator Agent. Review the conversation history.
Determine if the user is:
1. Providing a new idea ("idea_new")
2. Answering a clarifying question about an idea ("idea_refine")
3. Requesting a change to the generated plan ("plan_update")
4. Asking a conversational question that needs a direct reply ("chat")

Output strictly JSON:
{
  "intent": "idea_new" | "idea_refine" | "plan_update" | "chat",
  "response": "Provide a conversational reply if intent is 'chat'. Null otherwise.",
  "options": ["optional", "suggested", "replies", "if chat"]
}`;

  const tools = [{
    type: "function" as const,
    function: {
      name: "export_pdf",
      description: "Export the current plan to a PDF document if the user requests it."
    }
  }];

  const result: any = await chatCompletion(ctx, systemPrompt, currentInput, "Router", tools, true);
  
  if (result && result.tool_calls) {
    const toolCall = result.tool_calls.find((tc: any) => tc.function.name === 'export_pdf');
    if (toolCall) {
      ctx.sendEvent("export_pdf", {});
      ctx.sendEvent("text", { text: "I have triggered the PDF export for you.", agent: "Coordinator" });
      return { status: "done" };
    }
  }

  if (!result || result.intent === "chat") {
     ctx.sendEvent("text", { text: result?.response || "I didn't quite catch that.", agent: "Coordinator", options: result?.options });
     return { status: "done" };
  }

  if (result.intent === "plan_update") {
      ctx.sendEvent("text", { text: "I am dispatching the Planner subagent to update your roadmap.", agent: "Coordinator" });
      return { status: "planning", nextInput: currentInput };
  }

  // Both idea_new and idea_refine go to clarifier.
  if (result.intent === "idea_new") {
      ctx.sendEvent("text", { text: "I'll coordinate my subagents (Clarifier, Researcher, Planner) to build your plan.", agent: "Coordinator" });
  }

  return { status: "clarifying", nextInput: currentInput };
}
