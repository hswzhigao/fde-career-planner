import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authErrorResponse, clearSessionCookie, requireUser } from "@/lib/auth";
import { computeTransitionStage } from "@/lib/stage";

async function buildAccount(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  const profile = await prisma.profile.findFirst({ where: { userId } });
  const skillAssessmentCount = await prisma.skillAssessment.count({ where: { userId } });
  const learningTaskCount = await prisma.learningTask.count({ where: { userId } });
  const doneLearningTaskCount = await prisma.learningTask.count({ where: { userId, status: "done" } });
  const stage = computeTransitionStage({
    hasProfile: !!profile && (!!profile.current_role || profile.years_of_experience > 0 || !!profile.target_role_type),
    skillAssessmentCount,
    learningTaskCount,
    doneLearningTaskCount,
  });
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname || user.email.split("@")[0],
    avatarSeed: user.avatarSeed,
    role: user.role,
    createdAt: user.createdAt,
    stage,
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireUser(req);
    const account = await buildAccount(session.userId);
    if (!account) return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    return NextResponse.json(account);
  } catch (e) {
    return authErrorResponse(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireUser(req);
    const body = await req.json();
    const { userId: _uid, id: _id, ...rest } = body;
    const nickname = String(rest.nickname ?? "").trim();
    const updated = await prisma.user.update({ where: { id: session.userId }, data: { nickname } });
    return NextResponse.json({ id: updated.id, email: updated.email, nickname: updated.nickname, role: updated.role });
  } catch (e) {
    return authErrorResponse(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireUser(req);
    const body = await req.json();
    if (body.confirmText !== "删除账号") {
      return NextResponse.json({ error: "请输入 删除账号 确认" }, { status: 400 });
    }
    if (session.role === "admin") {
      const adminCount = await prisma.user.count({ where: { role: "admin" } });
      if (adminCount <= 1) return NextResponse.json({ error: "最后一个管理员不能删除自己" }, { status: 400 });
    }
    await prisma.user.delete({ where: { id: session.userId } });
    const res = NextResponse.json({ deleted: true });
    clearSessionCookie(res);
    return res;
  } catch (e) {
    return authErrorResponse(e);
  }
}
