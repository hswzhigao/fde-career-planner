import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { runStreamingAI } from "@/lib/ai/stream";
import { SYSTEM_PROMPT, generatePlanPrompt } from "@/lib/ai/prompts";
import { SKILLS } from "@/lib/constants/skills";

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

    const userPrompt = generatePlanPrompt(
      profile as unknown as Record<string, unknown>,
      skills,
    );

    const stream = await runStreamingAI(
      SYSTEM_PROMPT,
      userPrompt,
      "learning_plan",
      undefined,
      async (full) => {
        await prisma.aiSummary.create({
          data: { type: "learning_plan", content: full, userId: session.userId },
        });

        // Try to parse JSON tasks and save them
        try {
          const jsonMatch = full.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const tasks = JSON.parse(jsonMatch[0]);
            for (const task of tasks) {
              await prisma.learningTask.create({
                data: { ...task, userId: session.userId },
              });
            }
          }
        } catch {
          // JSON parse failed, just save the text
        }
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
