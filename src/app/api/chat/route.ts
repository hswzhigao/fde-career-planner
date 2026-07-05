import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { chatMultiTurn } from "@/lib/ai/client";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts";

// GET: list all chat sessions
export async function GET() {
  const sessions = await prisma.chatSession.findMany({
    orderBy: { updated_at: "desc" },
    include: {
      messages: {
        orderBy: { created_at: "asc" },
        take: 1, // just first message for preview
      },
    },
  });
  return NextResponse.json(sessions);
}

// POST: send a message and get streaming response
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, message } = body;

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: "消息不能为空" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get or create session
    let session;
    if (sessionId) {
      session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: { orderBy: { created_at: "asc" } } },
      });
      if (!session) {
        return new Response(JSON.stringify({ error: "会话不存在" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else {
      session = await prisma.chatSession.create({
        data: { title: message.slice(0, 30) },
        include: { messages: true },
      });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        session_id: session.id,
        role: "user",
        content: message,
      },
    });

    // Build message history for multi-turn
    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...session.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

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

          // Save assistant message
          await prisma.chatMessage.create({
            data: {
              session_id: session.id,
              role: "assistant",
              content: full,
            },
          });

          // Update session title if first message
          if (session.messages.length === 0) {
            await prisma.chatSession.update({
              where: { id: session.id },
              data: { title: message.slice(0, 30) },
            });
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done", full, sessionId: session.id })}\n\n`),
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
