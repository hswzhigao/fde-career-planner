import { chatOnce } from "./client";
import { SYSTEM_PROMPT, generatePlanPrompt } from "./prompts";

export async function generatePlan(
  profile: Record<string, unknown>,
  skills: { key: string; label: string; category: string; score: number }[],
): Promise<string> {
  return chatOnce(SYSTEM_PROMPT, generatePlanPrompt(profile, skills));
}
