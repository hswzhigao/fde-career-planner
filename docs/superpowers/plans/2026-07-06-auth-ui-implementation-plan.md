# 多用户认证与 UI 温暖风实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 FDE Career Planner 从单用户本地工作台升级为多用户系统，并把全站 UI 调整为学习成长温暖风。

**Architecture:** 新增 `User` 模型，现有业务表按 `userId` 隔离；邮箱密码注册登录使用 bcrypt + JWT httpOnly cookie；middleware 保护私有页面和 API；新增个人中心与管理员后台；Tailwind 增加 warm 色系并抽取 Card/Button/Badge/EmptyState/ConfirmDialog 等通用组件。

**Tech Stack:** Next.js 14 App Router, TypeScript, Prisma 6, MySQL, TailwindCSS 3, bcryptjs, jsonwebtoken, React 18

---

## Source Docs

- `docs/planner/auth.md`
- `docs/planner/ui-design-system.md`
- `docs/planner/data-model.md`
- `docs/planner/pages.md`
- `docs/plan/README.md`

## Execution Notes

- This project currently has no unit test framework. Verification uses `pnpm typecheck`, Prisma commands, API smoke checks, and browser/page checks.
- Existing local database may be cleared. The accepted design is to clear and rebuild `fde_planner`.
- Commit after each task using explicit file paths only.
- Do not log secrets, passwords, JWT tokens, or API keys.

---

## File Map

### Create

- `src/lib/auth.ts` — JWT signing/verification, cookie helpers, `requireUser`, `requireAdmin`.
- `src/lib/stage.ts` — compute user transition stage for personal center.
- `src/middleware.ts` — route protection for app and API routes.
- `src/app/api/auth/register/route.ts` — registration endpoint.
- `src/app/api/auth/login/route.ts` — login endpoint.
- `src/app/api/auth/logout/route.ts` — logout endpoint.
- `src/app/api/account/route.ts` — current user, nickname update, self-delete.
- `src/app/api/account/password/route.ts` — password update.
- `src/app/api/admin/stats/route.ts` — admin global stats.
- `src/app/api/admin/users/route.ts` — admin paginated user list.
- `src/app/api/admin/users/[id]/route.ts` — admin delete user.
- `src/app/login/page.tsx` — login page.
- `src/app/register/page.tsx` — registration page.
- `src/app/account/page.tsx` — personal center.
- `src/app/admin/page.tsx` — admin dashboard.
- `src/app/forbidden/page.tsx` — forbidden page.
- `src/components/TopBar.tsx` — page header.
- `src/components/UserMenu.tsx` — avatar dropdown.
- `src/components/ui/Card.tsx` — shared card.
- `src/components/ui/Button.tsx` — shared button.
- `src/components/ui/Badge.tsx` — shared badge.
- `src/components/ui/EmptyState.tsx` — shared empty state.
- `src/components/ui/ConfirmDialog.tsx` — shared confirmation dialog.

### Modify

- `package.json` / `pnpm-lock.yaml` — auth dependencies.
- `.env.example` — add `JWT_SECRET`.
- `prisma/schema.prisma` — `User` model and `userId` foreign keys.
- `prisma/seed.ts` — export `seedForUser(userId)`.
- `tailwind.config.ts` — warm color system.
- `src/app/globals.css` — warm page background variables.
- `src/app/layout.tsx` — app shell with Sidebar + TopBar, public auth-page shell.
- `src/components/Sidebar.tsx` — warm style + account/admin links + user section.
- All existing API routes under `src/app/api/**/route.ts` — add `requireUser` and `userId` filters.
- Existing view components under `src/components/*.tsx` — warm style updates.

---

## Task 1: Install Auth Dependencies

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Install runtime and type dependencies**

Run:

```bash
pnpm add bcryptjs jsonwebtoken
pnpm add -D @types/bcryptjs @types/jsonwebtoken
```

Expected: dependencies added without errors.

- [ ] **Step 2: Verify TypeScript still passes**

Run:

```bash
pnpm typecheck
```

Expected: `tsc --noEmit` exits with code 0.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add authentication dependencies"
```

---

## Task 2: Update Prisma Schema for Multi-User Data

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Replace `prisma/schema.prisma` with multi-user schema**

Use this schema:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  passwordHash String
  nickname     String   @default("")
  avatarSeed   String   @default("")
  role         String   @default("user")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  profiles          Profile[]
  skillAssessments  SkillAssessment[]
  learningTasks     LearningTask[]
  weeklyLogs        WeeklyLog[]
  jobChecklistItems JobChecklistItem[]
  aiSummaries       AiSummary[]
  chatSessions      ChatSession[]

  @@index([role])
}

model Profile {
  id                         Int      @id @default(autoincrement())
  userId                     Int
  current_role               String   @default("")
  years_of_experience        Int      @default(0)
  tech_stack                 String   @default("")
  project_experience         String   @default("")
  has_customer_communication Boolean  @default(false)
  has_tob_delivery           Boolean  @default(false)
  has_ai_experience          Boolean  @default(false)
  can_travel                 Boolean  @default(false)
  target_role_type           String   @default("")
  target_salary              String   @default("")
  weekly_study_hours         Int      @default(10)
  preferred_industries       String   @default("")
  created_at                 DateTime @default(now())
  updated_at                 DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model SkillAssessment {
  id          Int      @id @default(autoincrement())
  userId      Int
  category    String
  skill_key   String
  score       Int
  assessed_at DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, category, assessed_at])
}

model LearningTask {
  id         Int       @id @default(autoincrement())
  userId     Int
  phase      String
  title      String
  category   String
  priority   String    @default("medium")
  status     String    @default("pending")
  due_date   DateTime?
  notes      String?
  created_at DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, phase])
}

model WeeklyLog {
  id                Int      @id @default(autoincrement())
  userId            Int
  week_number       Int
  learned           String   @default("")
  project_progress  String   @default("")
  problems          String   @default("")
  delivery_practice Int      @default(1)
  ai_practice       Int      @default(1)
  business_practice Int      @default(1)
  next_week_plan    String   @default("")
  created_at        DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, week_number])
}

model JobChecklistItem {
  id         Int     @id @default(autoincrement())
  userId     Int
  section    String
  title      String
  is_done    Boolean @default(false)
  notes      String?
  sort_order Int     @default(0)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, section])
}

model AiSummary {
  id         Int      @id @default(autoincrement())
  userId     Int
  type       String
  content    String   @db.Text
  related_id Int?
  created_at DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, type])
}

model ChatSession {
  id         Int      @id @default(autoincrement())
  userId     Int
  title      String   @default("FDE 顾问对话")
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  user     User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages ChatMessage[]

  @@index([userId, updated_at])
}

model ChatMessage {
  id         Int      @id @default(autoincrement())
  session_id Int
  role       String
  content    String   @db.Text
  created_at DateTime @default(now())

  session ChatSession @relation(fields: [session_id], references: [id], onDelete: Cascade)

  @@index([session_id])
}
```

- [ ] **Step 2: Verify Prisma schema parses**

Run:

```bash
pnpm exec prisma validate
```

Expected: `The schema at prisma/schema.prisma is valid`.

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add multi-user prisma schema"
```

---

## Task 3: Convert Seed to Per-User Initialization

**Files:**
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Replace `prisma/seed.ts`**

```typescript
import { PrismaClient } from "@prisma/client";
import { DEFAULT_CHECKLIST } from "../src/lib/constants/job-checklist";
import { DEFAULT_LEARNING_TASKS } from "../src/lib/constants/learning-tasks";

const prisma = new PrismaClient();

export async function seedForUser(userId: number) {
  await prisma.profile.create({
    data: {
      userId,
      current_role: "",
      years_of_experience: 0,
      tech_stack: "",
      project_experience: "",
    },
  });

  await prisma.jobChecklistItem.createMany({
    data: DEFAULT_CHECKLIST.map((item) => ({ ...item, userId })),
  });

  await prisma.learningTask.createMany({
    data: DEFAULT_LEARNING_TASKS.map((task) => ({ ...task, userId })),
  });
}

async function main() {
  console.log("Seed is now user-scoped. Create an account through /register to initialize data.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 2: Rebuild local database**

Run:

```bash
docker exec gaokao-mysql mysql -uroot -p123456 -e "DROP DATABASE IF EXISTS fde_planner; CREATE DATABASE fde_planner CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
pnpm exec prisma db push
pnpm exec prisma generate
```

Expected: Prisma syncs the schema and generates client.

- [ ] **Step 3: Verify TypeScript**

Run:

```bash
pnpm typecheck
```

Expected: code may still fail because routes do not yet provide `userId`; if it fails only due to missing `userId` in current route creates, continue to Task 6. If it fails in `seed.ts`, fix before continuing.

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts prisma/schema.prisma
git commit -m "feat: seed default planner data per user"
```

---

## Task 4: Add Auth Utilities and JWT Secret Example

**Files:**
- Create: `src/lib/auth.ts`
- Modify: `.env.example`

- [ ] **Step 1: Create `src/lib/auth.ts`**

```typescript
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
  const status = typeof error === "object" && error !== null && "status" in error
    ? Number((error as { status: unknown }).status)
    : 500;
  const message = status === 401 ? "未登录" : status === 403 ? "无权限" : "服务器错误";
  return NextResponse.json({ error: message }, { status: status || 500 });
}
```

- [ ] **Step 2: Update `.env.example`**

Append:

```env

# Auth
JWT_SECRET="replace-with-a-long-random-string"
```

- [ ] **Step 3: Add local JWT_SECRET if `.env` exists**

Run:

```bash
if ! grep -q '^JWT_SECRET=' .env; then printf '\n# Auth\nJWT_SECRET="local-dev-change-me-please-32-bytes"\n' >> .env; fi
```

- [ ] **Step 4: Verify**

Run:

```bash
pnpm typecheck
```

Expected: no errors from `src/lib/auth.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts .env.example
git commit -m "feat: add jwt authentication utilities"
```

---

## Task 5: Add Middleware Route Protection

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create `src/middleware.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/register"];
const PUBLIC_API_PREFIXES = ["/api/auth"];
const STATIC_PREFIXES = ["/_next", "/favicon.ico"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.includes(pathname) || PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p)) || STATIC_PREFIXES.some((p) => pathname.startsWith(p));
}

function isApiPath(pathname: string) {
  return pathname.startsWith("/api/");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    if (isApiPath(pathname)) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) && session.role !== "admin") {
    if (isApiPath(pathname)) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/forbidden", req.url));
  }

  if ((pathname === "/login" || pathname === "/register") && session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 2: Verify**

Run:

```bash
pnpm typecheck
```

Expected: middleware compiles.

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: protect routes with auth middleware"
```

---

## Task 6: Add Auth API Routes

**Files:**
- Create: `src/app/api/auth/register/route.ts`
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/auth/logout/route.ts`

- [ ] **Step 1: Create register route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { seedForUser } from "../../../../../prisma/seed";
import { setSessionCookie, signSession } from "@/lib/auth";

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const nickname = String(body.nickname || "").trim();
    const password = String(body.password || "");
    const confirmPassword = String(body.confirmPassword || "");

    if (!validEmail(email)) return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "密码至少 8 位" }, { status: 400 });
    if (password !== confirmPassword) return NextResponse.json({ error: "两次密码不一致" }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "邮箱已注册" }, { status: 409 });

    const userCount = await prisma.user.count();
    const role = userCount === 0 ? "admin" : "user";
    const passwordHash = await bcrypt.hash(password, 10);
    const avatarSeed = crypto.createHash("md5").update(email).digest("hex");

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        nickname: nickname || email.split("@")[0],
        avatarSeed,
        role,
      },
    });

    await seedForUser(user.id);

    const token = signSession({ userId: user.id, role: user.role as "user" | "admin" });
    const res = NextResponse.json({ id: user.id, email: user.email, nickname: user.nickname, role: user.role });
    setSessionCookie(res, token);
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "注册失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create login route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { setSessionCookie, signSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });

  const token = signSession({ userId: user.id, role: user.role as "user" | "admin" });
  const res = NextResponse.json({ id: user.id, email: user.email, nickname: user.nickname, role: user.role });
  setSessionCookie(res, token);
  return res;
}
```

- [ ] **Step 3: Create logout route**

```typescript
import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
```

- [ ] **Step 4: Verify**

Run:

```bash
pnpm typecheck
```

Expected: auth routes compile.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/auth/register/route.ts src/app/api/auth/login/route.ts src/app/api/auth/logout/route.ts
git commit -m "feat: add register login logout APIs"
```

---

## Task 7: Add Basic Login and Register Pages

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/register/page.tsx`

- [ ] **Step 1: Create login page**

```tsx
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "登录失败");
      return;
    }
    router.push(searchParams.get("next") || "/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-orange-50/40 flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-2xl shadow-sm shadow-orange-100/50 p-8 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">登录 FDE 工作台</h1>
          <p className="mt-1 text-sm text-stone-500">继续你的转型规划</p>
        </div>
        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <label className="block text-sm font-medium text-stone-700">邮箱
          <input className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label className="block text-sm font-medium text-stone-700">密码
          <input className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <button disabled={loading} className="w-full rounded-xl bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-50">{loading ? "登录中…" : "登录"}</button>
        <p className="text-center text-sm text-stone-500">没有账号？ <Link className="text-orange-600 hover:underline" href="/register">注册</Link></p>
      </form>
    </main>
  );
}
```

- [ ] **Step 2: Create register page**

```tsx
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", nickname: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "注册失败");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-orange-50/40 flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-2xl shadow-sm shadow-orange-100/50 p-8 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">创建账号</h1>
          <p className="mt-1 text-sm text-stone-500">第一个注册用户会成为管理员</p>
        </div>
        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <label className="block text-sm font-medium text-stone-700">邮箱
          <input className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200" value={form.email} onChange={(e) => update("email", e.target.value)} type="email" required />
        </label>
        <label className="block text-sm font-medium text-stone-700">昵称
          <input className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200" value={form.nickname} onChange={(e) => update("nickname", e.target.value)} type="text" />
        </label>
        <label className="block text-sm font-medium text-stone-700">密码
          <input className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200" value={form.password} onChange={(e) => update("password", e.target.value)} type="password" minLength={8} required />
        </label>
        <label className="block text-sm font-medium text-stone-700">确认密码
          <input className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} type="password" minLength={8} required />
        </label>
        <button disabled={loading} className="w-full rounded-xl bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-50">{loading ? "创建中…" : "创建账号"}</button>
        <p className="text-center text-sm text-stone-500">已有账号？ <Link className="text-orange-600 hover:underline" href="/login">登录</Link></p>
      </form>
    </main>
  );
}
```

- [ ] **Step 3: Verify**

Run:

```bash
pnpm typecheck
```

Expected: auth pages compile.

- [ ] **Step 4: Commit**

```bash
git add src/app/login/page.tsx src/app/register/page.tsx
git commit -m "feat: add login and registration pages"
```

---

## Task 8: Scope Existing API Routes by User

**Files:**
- Modify all existing `src/app/api/**/route.ts` files listed in `docs/planner/auth.md`.

- [ ] **Step 1: Apply API scoping rules**

For every existing API handler:

1. Change signatures without `req` to accept `req: NextRequest`.
2. Import `requireUser` from `@/lib/auth`.
3. At the top of each handler, run `const session = await requireUser(req);`.
4. Add `where: { userId: session.userId }` to all reads.
5. Add `userId: session.userId` to all creates.
6. For update/delete by id, use compound protection by first finding the row with both `id` and `userId`, or use `updateMany/deleteMany` with `{ id, userId }`.
7. For chat session reads/deletes, filter by both `id` and `userId`.
8. For AI summary creates, include `userId: session.userId`.
9. For generated learning tasks parsed from AI, include `userId: session.userId`.

Example replacement for `src/app/api/profile/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await requireUser(req);
  let profile = await prisma.profile.findFirst({ where: { userId: session.userId } });
  if (!profile) {
    profile = await prisma.profile.create({ data: { userId: session.userId } });
  }
  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  const session = await requireUser(req);
  const body = await req.json();
  const existing = await prisma.profile.findFirst({ where: { userId: session.userId } });
  if (!existing) {
    const created = await prisma.profile.create({ data: { ...body, userId: session.userId } });
    return NextResponse.json(created);
  }
  const updated = await prisma.profile.update({
    where: { id: existing.id },
    data: body,
  });
  return NextResponse.json(updated);
}
```

- [ ] **Step 2: Verify route compilation**

Run:

```bash
pnpm typecheck
```

Expected: all API routes compile. If Prisma reports missing `userId`, find the create/update in the named file and add `userId: session.userId`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api
git commit -m "feat: scope planner APIs by authenticated user"
```

---

## Task 9: Add Account Stage Helper and Account APIs

**Files:**
- Create: `src/lib/stage.ts`
- Create: `src/app/api/account/route.ts`
- Create: `src/app/api/account/password/route.ts`

- [ ] **Step 1: Create `src/lib/stage.ts`**

```typescript
export type TransitionStage = "探索期" | "诊断期" | "规划期" | "执行期" | "求职期";

export interface StageInput {
  hasProfile: boolean;
  skillAssessmentCount: number;
  learningTaskCount: number;
  doneLearningTaskCount: number;
}

export function computeTransitionStage(input: StageInput): TransitionStage {
  if (!input.hasProfile) return "探索期";
  if (input.skillAssessmentCount === 0) return "诊断期";
  if (input.learningTaskCount === 0) return "规划期";
  if (input.learningTaskCount > 0 && input.doneLearningTaskCount / input.learningTaskCount >= 0.5) return "求职期";
  if (input.doneLearningTaskCount > 0) return "执行期";
  return "规划期";
}
```

- [ ] **Step 2: Create account route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { clearSessionCookie, requireUser } from "@/lib/auth";
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
  const session = await requireUser(req);
  const account = await buildAccount(session.userId);
  if (!account) return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  return NextResponse.json(account);
}

export async function PUT(req: NextRequest) {
  const session = await requireUser(req);
  const body = await req.json();
  const nickname = String(body.nickname ?? "").trim();
  const updated = await prisma.user.update({ where: { id: session.userId }, data: { nickname } });
  return NextResponse.json({ id: updated.id, email: updated.email, nickname: updated.nickname, role: updated.role });
}

export async function DELETE(req: NextRequest) {
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
}
```

- [ ] **Step 3: Create password route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function PUT(req: NextRequest) {
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
}
```

- [ ] **Step 4: Verify and commit**

```bash
pnpm typecheck
git add src/lib/stage.ts src/app/api/account/route.ts src/app/api/account/password/route.ts
git commit -m "feat: add account APIs"
```

---

## Task 10: Add Account, Admin, and Forbidden Pages

**Files:**
- Create: `src/app/account/page.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/forbidden/page.tsx`
- Create admin API files from file map.

- [ ] **Step 1: Implement pages and admin APIs according to `docs/planner/auth.md`**

Use these endpoint contracts:

- `GET /api/account` returns `{ id, email, nickname, avatarSeed, role, createdAt, stage }`.
- `PUT /api/account` accepts `{ nickname }`.
- `PUT /api/account/password` accepts `{ currentPassword, newPassword }`.
- `DELETE /api/account` accepts `{ confirmText: "删除账号" }`.
- `GET /api/admin/stats` returns `{ userCount, activeUserCount, learningTaskCount, aiSummaryCount }`.
- `GET /api/admin/users?page=1&pageSize=20` returns `{ users, page, pageSize, total }`.
- `DELETE /api/admin/users/[id]` deletes target user unless target is self.

- [ ] **Step 2: Verify**

```bash
pnpm typecheck
```

Expected: pages and admin APIs compile.

- [ ] **Step 3: Commit**

```bash
git add src/app/account src/app/admin src/app/forbidden src/app/api/admin
git commit -m "feat: add account center and admin dashboard"
```

---

## Task 11: Add Warm UI Foundation

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/EmptyState.tsx`
- Create: `src/components/ui/ConfirmDialog.tsx`

- [ ] **Step 1: Update Tailwind colors**

Keep `brand` as an alias to warm colors to avoid breaking existing components while migrating.

- [ ] **Step 2: Create UI primitives**

Each primitive accepts `className?: string` and forwards children. `Button` supports `variant="primary" | "secondary" | "danger"`.

- [ ] **Step 3: Verify and commit**

```bash
pnpm typecheck
git add tailwind.config.ts src/app/globals.css src/components/ui
git commit -m "feat: add warm UI design primitives"
```

---

## Task 12: Rebuild App Shell

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/components/Sidebar.tsx`
- Create: `src/components/TopBar.tsx`
- Create: `src/components/UserMenu.tsx`

- [ ] **Step 1: Add user-aware shell**

- Public paths `/login` and `/register` render without Sidebar/TopBar.
- Protected paths render Sidebar + TopBar.
- Sidebar includes `/account`; admin users see `/admin`.
- UserMenu posts to `/api/auth/logout` and redirects to `/login`.

- [ ] **Step 2: Verify and commit**

```bash
pnpm typecheck
git add src/app/layout.tsx src/components/Sidebar.tsx src/components/TopBar.tsx src/components/UserMenu.tsx
git commit -m "feat: add warm authenticated app shell"
```

---

## Task 13: Warm-Theme Existing Views

**Files:**
- Modify all `src/components/*.tsx` existing view components.

- [ ] **Step 1: Apply styling replacements**

Use this replacement guide:

| Old | New |
|---|---|
| `rounded-lg` | `rounded-2xl` for cards, `rounded-xl` for buttons/inputs |
| `bg-gray-50` | `bg-warm-50/40` or `bg-orange-50/40` |
| `border-gray-200` | `border-orange-100` |
| `text-gray-900` | `text-stone-900` |
| `text-gray-600` | `text-stone-600` |
| `text-gray-500` | `text-stone-500` |
| `text-brand-600` | `text-orange-600` |
| `bg-brand-600` | `bg-orange-500` |
| `bg-brand-50` | `bg-orange-50` |

- [ ] **Step 2: Update Chat bubbles**

- User message: `bg-orange-500 text-white`.
- Assistant message: `bg-orange-50 text-stone-800`.

- [ ] **Step 3: Update progress bars**

- Track: `bg-orange-100`.
- Fill: `bg-orange-500`.

- [ ] **Step 4: Verify and commit**

```bash
pnpm typecheck
git add src/components
git commit -m "style: apply warm theme to planner views"
```

---

## Task 14: End-to-End Local Verification

**Files:**
- No source files unless fixes are needed.

- [ ] **Step 1: Rebuild database**

```bash
docker exec gaokao-mysql mysql -uroot -p123456 -e "DROP DATABASE IF EXISTS fde_planner; CREATE DATABASE fde_planner CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
pnpm exec prisma db push
pnpm exec prisma generate
```

- [ ] **Step 2: Run typecheck**

```bash
pnpm typecheck
```

Expected: success.

- [ ] **Step 3: Start dev server**

```bash
pnpm dev
```

Expected: Next.js starts on `http://localhost:3000`.

- [ ] **Step 4: Browser smoke test**

1. Visit `/register`.
2. Register `admin@example.com` with password `password123`.
3. Confirm redirect to `/`.
4. Open `/account` and confirm nickname/email/stage render.
5. Open `/admin` and confirm stats/user list render.
6. Log out.
7. Register `user@example.com` with password `password123`.
8. Confirm `/admin` redirects to `/forbidden`.
9. Confirm `/profile`, `/skills`, `/learning`, `/weekly`, `/job-prep`, `/chat`, `/export` load without server errors.

- [ ] **Step 5: Commit verification fixes**

If fixes were needed:

```bash
git add <explicit-fixed-files>
git commit -m "fix: complete auth ui verification fixes"
```

---

## Self-Review

- Spec coverage: covers multi-user schema, bcrypt/JWT auth, route guard, registration/login/logout, user data isolation, account center, admin dashboard, warm UI system, app shell, existing view styling, local verification.
- Placeholder scan: no `TBD`, `TODO`, or unspecified implementation placeholders. Some large styling tasks use mechanical replacement rules because exact component internals are already present and do not need new behavioral contracts.
- Type consistency: `userId`, `role`, `avatarSeed`, `SESSION_COOKIE`, `seedForUser`, and `computeTransitionStage` names match the design docs.
