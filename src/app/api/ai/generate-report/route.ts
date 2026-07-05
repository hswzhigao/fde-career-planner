import { prisma } from "@/lib/db";
import { runStreamingAI } from "@/lib/ai/stream";
import { SYSTEM_PROMPT, generateReportPrompt } from "@/lib/ai/prompts";
import { SKILLS } from "@/lib/constants/skills";

export async function POST() {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) {
      return new Response(JSON.stringify({ error: "请先填写个人画像" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const records = await prisma.skillAssessment.findMany({
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

    const allTasks = await prisma.learningTask.findMany();
    const doneTasks = allTasks.filter((t) => t.status === "done").length;
    const weeklyCount = await prisma.weeklyLog.count();
    const allChecklist = await prisma.jobChecklistItem.findMany();
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
          data: { type: "full_report", content: full },
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
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
