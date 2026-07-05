import { chatOnce } from "./client";
import { SYSTEM_PROMPT, analyzeGapPrompt } from "./prompts";

export async function analyzeGap(
  profile: Record<string, unknown>,
  skills: { key: string; label: string; category: string; score: number }[],
): Promise<string> {
  return chatOnce(SYSTEM_PROMPT, analyzeGapPrompt(profile, skills));
}
