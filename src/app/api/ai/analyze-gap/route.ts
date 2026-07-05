import { prisma } from "@/lib/db";
import { runStreamingAI } from "@/lib/ai/stream";
import { SYSTEM_PROMPT, analyzeGapPrompt } from "@/lib/ai/prompts";
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

    const userPrompt = analyzeGapPrompt(
      profile as unknown as Record<string, unknown>,
      skills,
    );

    const stream = await runStreamingAI(
      SYSTEM_PROMPT,
      userPrompt,
      "gap_analysis",
      undefined,
      async (full) => {
        await prisma.aiSummary.create({
          data: { type: "gap_analysis", content: full },
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
