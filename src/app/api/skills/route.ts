import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SKILLS } from "@/lib/constants/skills";

export async function GET() {
  const records = await prisma.skillAssessment.findMany({
    orderBy: { assessed_at: "desc" },
  });

  // 只取每个 skill_key 的最新一条
  const latest = new Map<string, (typeof records)[0]>();
  for (const r of records) {
    if (!latest.has(r.skill_key)) {
      latest.set(r.skill_key, r);
    }
  }

  // 补全未评分的
  const result = SKILLS.map((s) => {
    const rec = latest.get(s.key);
    return {
      key: s.key,
      label: s.label,
      category: s.category,
      score: rec?.score ?? 0,
      assessed_at: rec?.assessed_at ?? null,
    };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // body: [{ skill_key, category, score }, ...]
  const now = new Date();
  const created = await Promise.all(
    body.map((item: { skill_key: string; category: string; score: number }) =>
      prisma.skillAssessment.create({
        data: {
          skill_key: item.skill_key,
          category: item.category,
          score: item.score,
          assessed_at: now,
        },
      }),
    ),
  );
  return NextResponse.json({ saved: created.length });
}
