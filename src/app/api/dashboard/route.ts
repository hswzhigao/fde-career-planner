import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { SKILLS_BY_CATEGORY, type SkillCategory } from "@/lib/constants/skills";

export async function GET(req: NextRequest) {
  try {
    const session = await requireUser(req);
    const profile = await prisma.profile.findFirst({
      where: { userId: session.userId },
    });

    const skillRecords = await prisma.skillAssessment.findMany({
      where: { userId: session.userId },
      orderBy: { assessed_at: "desc" },
    });
    const latest = new Map<string, number>();
    for (const r of skillRecords) {
      if (!latest.has(r.skill_key)) latest.set(r.skill_key, r.score);
    }

    const cats: SkillCategory[] = ["delivery", "ai_engineering", "business"];
    const skillSummary = cats.map((cat) => {
      const skills = SKILLS_BY_CATEGORY(cat);
      const filled = skills.filter((s) => (latest.get(s.key) ?? 0) > 0);
      const total = filled.reduce((sum, s) => sum + (latest.get(s.key) ?? 0), 0);
      const avg = filled.length > 0 ? Number((total / filled.length).toFixed(1)) : 0;
      return { category: cat, avg, label: cat === "delivery" ? "客户交付" : cat === "ai_engineering" ? "AI 工程" : "业务理解" };
    });

    const allTasks = await prisma.learningTask.findMany({
      where: { userId: session.userId },
    });
    const phases = ["30", "60", "90"].map((p) => {
      const tasks = allTasks.filter((t) => t.phase === p);
      const done = tasks.filter((t) => t.status === "done").length;
      return { phase: p, total: tasks.length, done, progress: tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0 };
    });

    const latestWeekly = await prisma.weeklyLog.findFirst({
      where: { userId: session.userId },
      orderBy: { week_number: "desc" },
    });

    const allChecklist = await prisma.jobChecklistItem.findMany({
      where: { userId: session.userId },
    });
    const checklistDone = allChecklist.filter((c) => c.is_done).length;

    return NextResponse.json({
      profile,
      skillSummary,
      phases,
      latestWeekly,
      weeklyCount: await prisma.weeklyLog.count({ where: { userId: session.userId } }),
      jobPrep: { total: allChecklist.length, done: checklistDone, progress: allChecklist.length > 0 ? Math.round((checklistDone / allChecklist.length) * 100) : 0 },
    });
  } catch (e) {
    return authErrorResponse(e);
  }
}
