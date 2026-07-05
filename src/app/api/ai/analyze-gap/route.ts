import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { analyzeGap } from "@/lib/ai/gap";
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

    const result = await analyzeGap(
      profile as unknown as Record<string, unknown>,
      skills,
    );

    await prisma.aiSummary.create({
      data: { type: "gap_analysis", content: result },
    });

    return NextResponse.json({ content: result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("analyze-gap error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
