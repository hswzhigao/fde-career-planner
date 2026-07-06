import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const SESSION_COOKIE = "fde_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export interface SessionUser {
  userId: number;
  role: "user" | "admin";
}

interface JwtPayload {
  sub: string;
  role: "user" | "admin";
  iat?: number;
  exp?: number;
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}

export function signSession(user: SessionUser) {
  return jwt.sign(
    { sub: String(user.userId), role: user.role },
    getJwtSecret(),
    { expiresIn: SESSION_MAX_AGE_SECONDS },
  );
}

export function verifySessionToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    const userId = Number(decoded.sub);
    if (!Number.isInteger(userId) || userId <= 0) return null;
    if (decoded.role !== "user" && decoded.role !== "admin") return null;
    return { userId, role: decoded.role };
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req: NextRequest): SessionUser | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function getSessionFromCookies(): SessionUser | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireUser(req: NextRequest): Promise<SessionUser> {
  const session = getSessionFromRequest(req);
  if (!session) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }
  return session;
}

export async function requireAdmin(req: NextRequest): Promise<SessionUser> {
  const session = await requireUser(req);
  if (session.role !== "admin") {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }
  return session;
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

export function authErrorResponse(error: unknown) {
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status: unknown }).status)
      : 500;
  const message = status === 401 ? "未登录" : status === 403 ? "无权限" : "服务器错误";
  return NextResponse.json({ error: message }, { status: status || 500 });
}
