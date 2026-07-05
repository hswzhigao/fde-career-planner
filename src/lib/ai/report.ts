import { chatOnce } from "./client";
import { SYSTEM_PROMPT, generateReportPrompt } from "./prompts";

export async function generateReport(data: {
  profile: Record<string, unknown>;
  skills: { key: string; label: string; category: string; score: number }[];
  learningProgress: { total: number; done: number };
  weeklyCount: number;
  jobPrepProgress: { total: number; done: number };
}): Promise<string> {
  return chatOnce(SYSTEM_PROMPT, generateReportPrompt(data));
}
