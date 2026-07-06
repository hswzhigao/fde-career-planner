import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { runStreamingAI } from "@/lib/ai/stream";
import { SYSTEM_PROMPT, generateReportPrompt } from "@/lib/ai/prompts";
import { SKILLS } from "@/lib/constants/skills";
import { getLatestSummary } from "@/lib/ai/history";

export async function GET(req: NextRequest) {
  return getLatestSummary(req, "full_report");
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser(req);
    const profile = await prisma.profile.findFirst({
      where: { userId: session.userId },
    });
    if (!profile) {
      return new Response(JSON.stringify({ error: "请先填写个人画像" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const records = await prisma.skillAssessment.findMany({
      where: { userId: session.userId },
      orderBy: { assessed_at: "desc" },
    });
    const latest = new Map<string, number>();
    for (const r of records) {
      if (!latest.has(r.skill_key)) latest.set(r.skill_key, r.score);
    }
    const skills = SKILLS.map((s) => ({
      key: s.key,
      label: s.label,
      category: s.category,
      score: latest.get(s.key) ?? 0,
    }));

    const allTasks = await prisma.learningTask.findMany({
      where: { userId: session.userId },
    });
    const doneTasks = allTasks.filter((t) => t.status === "done").length;
    const weeklyCount = await prisma.weeklyLog.count({
      where: { userId: session.userId },
    });
    const allChecklist = await prisma.jobChecklistItem.findMany({
      where: { userId: session.userId },
    });
    const doneChecklist = allChecklist.filter((c) => c.is_done).length;

    const userPrompt = generateReportPrompt({
      profile: profile as unknown as Record<string, unknown>,
      skills,
      learningProgress: { total: allTasks.length, done: doneTasks },
      weeklyCount,
      jobPrepProgress: { total: allChecklist.length, done: doneChecklist },
    });

    const stream = await runStreamingAI(
      SYSTEM_PROMPT,
      userPrompt,
      "full_report",
      undefined,
      async (full) => {
        await prisma.aiSummary.create({
          data: { type: "full_report", content: full, userId: session.userId },
        });
      },
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    return authErrorResponse(e);
  }
}
