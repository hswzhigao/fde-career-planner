import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authErrorResponse, requireAdmin } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await requireAdmin(req);
    const id = Number(params.id);
    if (Number.isNaN(id) || id <= 0) {
      return NextResponse.json({ error: "无效的用户 ID" }, { status: 400 });
    }
    if (id === session.userId) {
      return NextResponse.json({ error: "不能删除自己" }, { status: 400 });
    }
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (e) {
    return authErrorResponse(e);
  }
}
