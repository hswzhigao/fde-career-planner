import { chatOnce } from "./client";
import { SYSTEM_PROMPT, reviewWeeklyPrompt } from "./prompts";

export async function reviewWeekly(
  log: Record<string, unknown>,
  history: { week_number: number; delivery_practice: number; ai_practice: number; business_practice: number }[],
): Promise<string> {
  return chatOnce(SYSTEM_PROMPT, reviewWeeklyPrompt(log, history));
}
