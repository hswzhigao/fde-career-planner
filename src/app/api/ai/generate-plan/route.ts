import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generatePlan } from "@/lib/ai/plan";
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

    const result = await generatePlan(
      profile as unknown as Record<string, unknown>,
      skills,
    );

    // Try to parse JSON tasks from the result
    let tasks: { phase: string; title: string; category: string; priority: string }[] = [];
    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        tasks = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // If parse fails, return text only
    }

    // Save parsed tasks to DB
    for (const task of tasks) {
      await prisma.learningTask.create({ data: task });
    }

    await prisma.aiSummary.create({
      data: { type: "learning_plan", content: result },
    });

    return NextResponse.json({ content: result, tasksAdded: tasks.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("generate-plan error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
