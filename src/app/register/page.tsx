"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type RegisterForm = {
  email: string;
  nickname: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>({
    email: "",
    nickname: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key: keyof RegisterForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
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
    <main className="flex min-h-screen items-center justify-center bg-orange-50/40 p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-sm shadow-orange-100/50"
      >
        <div>
          <h1 className="text-2xl font-bold text-stone-900">创建账号</h1>
          <p className="mt-1 text-sm text-stone-500">第一个注册用户会成为管理员</p>
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
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label className="block text-sm font-medium text-stone-700">
          昵称
          <input
            className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            value={form.nickname}
            onChange={(e) => update("nickname", e.target.value)}
            type="text"
            autoComplete="nickname"
          />
        </label>

        <label className="block text-sm font-medium text-stone-700">
          密码
          <input
            className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        <label className="block text-sm font-medium text-stone-700">
          确认密码
          <input
            className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        <button
          disabled={loading}
          className="w-full rounded-xl bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? "创建中…" : "创建账号"}
        </button>

        <p className="text-center text-sm text-stone-500">
          已有账号？{" "}
          <Link className="text-orange-600 hover:underline" href="/login">
            登录
          </Link>
        </p>
      </form>
    </main>
  );
}
