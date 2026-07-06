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
    <main className="flex min-h-screen items-center justify-center bg-orange-50/40 p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-sm shadow-orange-100/50"
      >
        <div>
          <h1 className="text-2xl font-bold text-stone-900">登录 FDE 工作台</h1>
          <p className="mt-1 text-sm text-stone-500">继续你的转型规划</p>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <label className="block text-sm font-medium text-stone-700">
          邮箱
          <input
            className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label className="block text-sm font-medium text-stone-700">
          密码
          <input
            className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            required
          />
        </label>

        <button
          disabled={loading}
          className="w-full rounded-xl bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? "登录中…" : "登录"}
        </button>

        <p className="text-center text-sm text-stone-500">
          没有账号？{" "}
          <Link className="text-orange-600 hover:underline" href="/register">
            注册
          </Link>
        </p>
      </form>
    </main>
  );
}
