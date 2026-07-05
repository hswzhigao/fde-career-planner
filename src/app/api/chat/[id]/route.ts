import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = parseInt(params.id);
  const session = await prisma.chatSession.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { created_at: "asc" } },
    },
  });
  if (!session) {
    return NextResponse.json({ error: "会话不存在" }, { status: 404 });
  }
  return NextResponse.json(session);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = parseInt(params.id);
  await prisma.chatSession.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
