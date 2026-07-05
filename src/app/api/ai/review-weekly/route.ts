import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { runStreamingAI } from "@/lib/ai/stream";
import { SYSTEM_PROMPT, reviewWeeklyPrompt } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const logId = body.logId;
    if (!logId) {
      return new Response(JSON.stringify({ error: "缺少 logId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const log = await prisma.weeklyLog.findUnique({ where: { id: logId } });
    if (!log) {
      return new Response(JSON.stringify({ error: "周报不存在" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const history = await prisma.weeklyLog.findMany({
      where: { week_number: { lt: log.week_number } },
      orderBy: { week_number: "asc" },
      select: {
        week_number: true,
        delivery_practice: true,
        ai_practice: true,
        business_practice: true,
      },
    });

    const userPrompt = reviewWeeklyPrompt(
      log as unknown as Record<string, unknown>,
      history,
    );

    const stream = await runStreamingAI(
      SYSTEM_PROMPT,
      userPrompt,
      "weekly_review",
      log.id,
      async (full) => {
        await prisma.aiSummary.create({
          data: { type: "weekly_review", content: full, related_id: log.id },
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
