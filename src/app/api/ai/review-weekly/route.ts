import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { runStreamingAI } from "@/lib/ai/stream";
import { SYSTEM_PROMPT, reviewWeeklyPrompt } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser(req);
    const body = await req.json();
    const logId = body.logId;
    if (!logId) {
      return new Response(JSON.stringify({ error: "缺少 logId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const log = await prisma.weeklyLog.findFirst({
      where: { id: logId, userId: session.userId },
    });
    if (!log) {
      return new Response(JSON.stringify({ error: "周报不存在" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const history = await prisma.weeklyLog.findMany({
      where: { userId: session.userId, week_number: { lt: log.week_number } },
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
          data: { type: "weekly_review", content: full, related_id: log.id, userId: session.userId },
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
