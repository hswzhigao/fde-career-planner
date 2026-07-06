import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "fde_session";
const AUTH_PAGES = ["/login", "/register"];
const PUBLIC_API_PREFIX = "/api/auth/";
const STATIC_PREFIXES = ["/_next/static", "/_next/image"];

type SessionUser = {
  userId: number;
  role: "user" | "admin";
};

function isAuthPage(pathname: string) {
  return AUTH_PAGES.includes(pathname);
}

function isApiPath(pathname: string) {
  return pathname.startsWith("/api/");
}

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/admin/");
}

function isPublicPath(pathname: string) {
  return (
    isAuthPage(pathname) ||
    pathname === "/api/auth" ||
    pathname.startsWith(PUBLIC_API_PREFIX) ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function decodeBase64UrlJson(value: string): unknown {
  const bytes = decodeBase64Url(value);
  return JSON.parse(new TextDecoder().decode(bytes));
}

function timingSafeEqual(expected: Uint8Array, actual: Uint8Array) {
  let difference = expected.length ^ actual.length;

  for (let i = 0; i < expected.length; i += 1) {
    difference |= expected[i] ^ (actual[i] ?? 0);
  }

  return difference === 0;
}

async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
    if (!encodedHeader || !encodedPayload || !encodedSignature || token.split(".").length !== 3) {
      return null;
    }

    const header = decodeBase64UrlJson(encodedHeader);
    if (typeof header !== "object" || header === null || !("alg" in header) || header.alg !== "HS256") {
      return null;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) return null;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = new Uint8Array(
      await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signingInput)),
    );
    const tokenSignature = decodeBase64Url(encodedSignature);

    if (!timingSafeEqual(expectedSignature, tokenSignature)) {
      return null;
    }

    const payload = decodeBase64UrlJson(encodedPayload);
    if (typeof payload !== "object" || payload === null) return null;

    const { sub, role, exp } = payload as { sub?: unknown; role?: unknown; exp?: unknown };
    const userId = typeof sub === "string" || typeof sub === "number" ? Number(sub) : NaN;
    if (!Number.isInteger(userId) || userId <= 0) return null;
    if (role !== "user" && role !== "admin") return null;
    if (exp !== undefined) {
      if (typeof exp !== "number" || !Number.isFinite(exp)) return null;
      if (exp <= Math.floor(Date.now() / 1000)) return null;
    }

    return { userId, role };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (isAuthPage(pathname) && session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!session) {
    if (isApiPath(pathname)) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminPath(pathname) && session.role !== "admin") {
    if (isApiPath(pathname)) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    return NextResponse.redirect(new URL("/forbidden", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
