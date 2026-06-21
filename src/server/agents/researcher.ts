import { AgentContext } from "./types";
import { chatCompletion } from "./helper";

const AVAILABLE_TOOLS = [
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Search the web for current information",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "calculator",
      description: "Perform mathematical calculations",
      parameters: {
        type: "object",
        properties: { expression: { type: "string" } },
        required: ["expression"]
      }
    }
  }
];

export async function runResearcher(ctx: AgentContext, input: string) {
  ctx.sendEvent("reasoning", { agent: "Researcher", status: "Validating assumptions..." });

  const systemPrompt = `You are the Researcher. Your job is to validate the low-confidence assumptions using tools if necessary. If no tools are needed, return a brief research summary.`;
  
  // Create a message that contains assumptions
  const assumptionsText = JSON.stringify(ctx.plan.assumptions);
  
  const responseMsg = await chatCompletion(ctx, systemPrompt, `Idea: ${input}\nAssumptions: ${assumptionsText}`, "Researcher", AVAILABLE_TOOLS, false);

  if (responseMsg && responseMsg.tool_calls) {
    for (const toolCall of responseMsg.tool_calls) {
      ctx.sendEvent("tool_call", { name: toolCall.function.name, args: toolCall.function.arguments });
      // Mock execution
      const args = JSON.parse(toolCall.function.arguments);
      let result = "Simulated tool result. " + Object.values(args).join(" ");
      
      if (toolCall.function.name === "calculator") {
        try { result = eval(args.expression).toString(); } catch(e) { result = "Error calculating"; }
      }
      
      ctx.sendEvent("tool_result", { name: toolCall.function.name, output: result, source: "Simulated" });
      ctx.plan.sources.push({ url: "https://example.com/simulated", title: `Simulated ${toolCall.function.name} Result` });
    }
    
    // Update some assumptions status
    ctx.plan.assumptions = ctx.plan.assumptions.map((a: any) => ({
      ...a,
      validationStatus: a.confidence === "low" ? "validated (simulated)" : a.validationStatus
    }));
    
    ctx.sendEvent("plan_update", { assumptions: ctx.plan.assumptions, sources: ctx.plan.sources });
  }

  return { status: "planning", nextInput: input };
}
