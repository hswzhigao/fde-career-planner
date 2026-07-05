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
 * One-shot chat: send system + user prompts, return full text.
 */
export async function chatOnce(systemPrompt: string, userPrompt: string): Promise<string> {
  const { full } = await chatStream(systemPrompt, userPrompt);
  return full;
}

/**
 * Streaming chat: send system + user prompts, call onDelta for each text chunk.
 * Returns the full text when done.
 */
export async function chatStream(
  systemPrompt: string,
  userPrompt: string,
  onDelta?: (delta: string, accumulated: string) => void,
): Promise<{ full: string }> {
  const model = getModel();
  const agent = createAgent({
    model,
    maxIterations: 1,
    includeBuiltinTools: false,
  });

  const session = await agent.createSession();

  session.send(systemPrompt);
  session.send(userPrompt);

  let result = "";
  for await (const event of session.receive()) {
    if (event.type === "text_delta") {
      result += event.delta ?? "";
      onDelta?.(event.delta ?? "", result);
    }
  }

  await session.dispose();
  return { full: result.trim() };
}
