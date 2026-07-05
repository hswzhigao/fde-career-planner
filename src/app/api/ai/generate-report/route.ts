import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateReport } from "@/lib/ai/report";
import { SKILLS } from "@/lib/constants/skills";

export async function POST() {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) {
      return NextResponse.json({ error: "请先填写个人画像" }, { status: 400 });
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

    const result = await generateReport({
      profile: profile as unknown as Record<string, unknown>,
      skills,
      learningProgress: { total: allTasks.length, done: doneTasks },
      weeklyCount,
      jobPrepProgress: { total: allChecklist.length, done: doneChecklist },
    });

    await prisma.aiSummary.create({
      data: { type: "full_report", content: result },
    });

    return NextResponse.json({ content: result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("generate-report error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
