import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authErrorResponse, requireUser } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  try {
    const session = await requireUser(req);
    const body = await req.json();
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    if (newPassword.length < 8) return NextResponse.json({ error: "新密码至少 8 位" }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "当前密码错误" }, { status: 400 });
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: session.userId }, data: { passwordHash } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return authErrorResponse(e);
  }
}
