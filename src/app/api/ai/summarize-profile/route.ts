import { prisma } from "@/lib/db";
import { runStreamingAI } from "@/lib/ai/stream";
import { SYSTEM_PROMPT, summarizeProfilePrompt } from "@/lib/ai/prompts";

export async function POST() {
  try {
    const profile = await prisma.profile.findFirst();
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
          data: { type: "profile_summary", content: full },
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
