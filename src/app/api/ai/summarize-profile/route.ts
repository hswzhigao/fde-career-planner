import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authErrorResponse, requireUser } from "@/lib/auth";
import { runStreamingAI } from "@/lib/ai/stream";
import { SYSTEM_PROMPT, summarizeProfilePrompt } from "@/lib/ai/prompts";
import { getLatestSummary } from "@/lib/ai/history";

export async function GET(req: NextRequest) {
  return getLatestSummary(req, "profile_summary");
}

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

    const userPrompt = summarizeProfilePrompt(
      profile as unknown as Record<string, unknown>,
    );

    const stream = await runStreamingAI(
      SYSTEM_PROMPT,
      userPrompt,
      "profile_summary",
      undefined,
      async (full) => {
        await prisma.aiSummary.create({
          data: { type: "profile_summary", content: full, userId: session.userId },
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
