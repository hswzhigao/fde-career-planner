import { chatOnce } from "./client";
import { SYSTEM_PROMPT, summarizeProfilePrompt } from "./prompts";

export async function summarizeProfile(profile: Record<string, unknown>): Promise<string> {
  const userPrompt = summarizeProfilePrompt(profile);
  return chatOnce(SYSTEM_PROMPT, userPrompt);
}
