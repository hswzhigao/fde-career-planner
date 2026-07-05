import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { chatMultiTurn } from "@/lib/ai/client";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts";

// POST: follow-up Q&A based on a previous AI result
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { previousContent, followupHistory, question } = body;

    if (!question?.trim()) {
      return new Response(JSON.stringify({ error: "问题不能为空" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build multi-turn context
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Add the original AI result as assistant context
    if (previousContent) {
      messages.push({ role: "assistant", content: previousContent });
    }

    // Add follow-up history
    if (Array.isArray(followupHistory)) {
      for (const msg of followupHistory) {
        messages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        });
      }
    }

    // Add current question
    messages.push({ role: "user", content: question });

    // Stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const { full } = await chatMultiTurn(messages, (delta, accumulated) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "delta", delta, accumulated })}\n\n`),
            );
          });

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done", full })}\n\n`),
          );
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Unknown error";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", error: msg })}\n\n`),
          );
        } finally {
          controller.close();
        }
      },
    });

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
