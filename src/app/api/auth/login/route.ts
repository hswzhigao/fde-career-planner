import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setSessionCookie, signSession } from "@/lib/auth";

const DUMMY_PASSWORD_HASH = "$2b$10$2XrRmpXX/mUO.pOuY8rWy.ZVDDgdM1zAgWzBSjUrcTEeIihA35gTi";

function normalizeEmail(email: unknown) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function safeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function invalidCredentialsResponse() {
  return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
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
  const password = safeString(body?.password);

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      nickname: true,
      role: true,
    },
  });

  if (!user) {
    await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
    return invalidCredentialsResponse();
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    return invalidCredentialsResponse();
  }

  const token = signSession({ userId: user.id, role: user.role as "user" | "admin" });
  const res = NextResponse.json(publicUser(user));
  setSessionCookie(res, token);
  return res;
}
