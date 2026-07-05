import { createModel, createAgent, createDeepSeekAdapter } from "@archships/dim-agent-sdk";

let cachedModel: ReturnType<typeof createModel> | null = null;

export function getModel() {
  if (cachedModel) return cachedModel;

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not set in .env.local");
  }

  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
  const modelId = process.env.DEEPSEEK_MODEL || "deepseek-chat";

  const adapter = createDeepSeekAdapter({
    apiKey,
    baseUrl,
    defaultModel: modelId,
  });

  cachedModel = createModel(adapter);
  return cachedModel;
}

/**
 * Simple one-shot chat: send system + user prompts, return full text response.
 */
export async function chatOnce(systemPrompt: string, userPrompt: string): Promise<string> {
  const model = getModel();
  const agent = createAgent({
    model,
    maxIterations: 1,
    includeBuiltinTools: false,
  });

  const session = await agent.createSession();

  // Send system message first, then user message
  // MessageContentInput = string | ContentBlock | ContentBlock[]
  session.send(systemPrompt);
  session.send(userPrompt);

  // Collect text deltas from the stream
  let result = "";
  for await (const event of session.receive()) {
    if (event.type === "text_delta") {
      result += event.delta ?? "";
    }
  }

  await session.dispose();
  return result.trim();
}
