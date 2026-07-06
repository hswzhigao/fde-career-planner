import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setSessionCookie, signSession } from "@/lib/auth";
import { seedForUser } from "../../../../../prisma/seed";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: unknown) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function safeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function publicUser(user: { id: number; email: string; nickname: string; role: string }) {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    role: user.role,
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = normalizeEmail(body?.email);
  const nicknameInput = safeString(body?.nickname).trim();
  const password = safeString(body?.password);
  const confirmPassword = safeString(body?.confirmPassword);

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "密码至少需要 8 位" }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ error: "两次输入的密码不一致" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return NextResponse.json({ error: "邮箱已注册" }, { status: 409 });
  }

  const userCount = await prisma.user.count();
  const passwordHash = await bcrypt.hash(password, 10);
  const avatarSeed = createHash("md5").update(email).digest("hex");
  const role = userCount === 0 ? "admin" : "user";

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      nickname: nicknameInput || email.split("@")[0],
      avatarSeed,
      role,
    },
    select: {
      id: true,
      email: true,
      nickname: true,
      role: true,
    },
  });

  await seedForUser(user.id);

  const token = signSession({ userId: user.id, role: user.role as "user" | "admin" });
  const res = NextResponse.json(publicUser(user));
  setSessionCookie(res, token);
  return res;
}
