import { AgentContext, PLAN_SCHEMA } from "./types";
import { runClarifier } from "./clarifier";
import { runAssumptionMapper } from "./assumptionMapper";
import { runResearcher } from "./researcher";
import { runPlanner } from "./planner";
import { runRouter } from "./router";

export async function executeAgents(ctx: AgentContext) {
  const context: AgentContext = {
    ...ctx,
    plan: ctx.plan || JSON.parse(JSON.stringify(PLAN_SCHEMA))
  };

  const userMessages = ctx.messages.filter(m => m.role === "user");
  let currentInput = userMessages[userMessages.length - 1]?.content || "";

  let state = "routing";

  let loops = 0;
  while (state !== "done" && loops < 5) {
    loops++;
    try {
      if (state === "routing") {
        const result = await runRouter(context, currentInput);
        state = result.status;
        if (result.nextInput) currentInput = result.nextInput;
      } else if (state === "clarifying") {
        const result = await runClarifier(context, currentInput);
        state = result.status;
        if (result.nextInput) currentInput = result.nextInput;
      } else if (state === "mapping_assumptions") {
        const result = await runAssumptionMapper(context, currentInput);
        state = result.status;
        if (result.nextInput) currentInput = result.nextInput;
      } else if (state === "researching") {
        const result = await runResearcher(context, currentInput);
        state = result.status;
        if (result.nextInput) currentInput = result.nextInput;
      } else if (state === "planning") {
        const result = await runPlanner(context, currentInput);
        state = result.status;
      } else {
        state = "done";
      }
    } catch (err: any) {
      console.error("Pipeline error:", err);
      context.sendEvent("error", { message: "Error in pipeline: " + err.message });
      state = "done";
    }
  }

  context.sendEvent("done", { message: "Pipeline complete" });
}
