import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authErrorResponse, requireUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await requireUser(req);
    const id = parseInt(params.id);
    const chatSession = await prisma.chatSession.findFirst({
      where: { id, userId: session.userId },
      include: {
        messages: { orderBy: { created_at: "asc" } },
      },
    });
    if (!chatSession) {
      return NextResponse.json({ error: "会话不存在" }, { status: 404 });
    }
    return NextResponse.json(chatSession);
  } catch (e) {
    return authErrorResponse(e);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await requireUser(req);
    const id = parseInt(params.id);
    const result = await prisma.chatSession.deleteMany({
      where: { id, userId: session.userId },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: "会话不存在" }, { status: 404 });
    }
    return NextResponse.json({ deleted: true });
  } catch (e) {
    return authErrorResponse(e);
  }
}
