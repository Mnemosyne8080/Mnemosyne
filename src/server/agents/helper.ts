import { AgentContext } from "./types";

export async function chatCompletion(
  ctx: AgentContext,
  systemPrompt: string,
  userMessage: string,
  roleLabel: string,
  tools: any[] = [],
  forceJson: boolean = false
) {
  const { openai, model, sendEvent } = ctx;

  sendEvent("reasoning", { agent: roleLabel, status: "thinking" });

  const messages = [
    { role: "system", content: systemPrompt },
    ...ctx.messages.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage }
  ];

  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
      tools: tools.length > 0 ? tools : undefined,
      response_format: forceJson ? { type: "json_object" } : undefined,
    });

    if (!response.choices || !response.choices[0]) {
      throw new Error("Invalid response from API: " + JSON.stringify(response));
    }

    const message = response.choices[0].message;
    
    if (message.tool_calls) {
      return message; // return raw message to handle tools
    }
    
    if (message.content) {
      if (forceJson) {
        return JSON.parse(message.content);
      }
      return message.content;
    }

    return null;
  } catch (error: any) {
    console.error(`Error in ${roleLabel}:`, error);
    sendEvent("error", { message: `Error in ${roleLabel}: ${error.message}` });
    return null;
  }
}
