import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const AUTH_PAGES = ["/login", "/register"];
const PUBLIC_API_PREFIX = "/api/auth/";
const STATIC_PREFIXES = ["/_next/static", "/_next/image"];

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
    STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    /\.[^/]+$/.test(pathname)
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? verifySessionToken(token) : null;

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
    loginUrl.searchParams.set("next", pathname);
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
