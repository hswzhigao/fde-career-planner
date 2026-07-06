"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Account {
  id: number;
  email: string;
  nickname: string;
  avatarSeed: string;
  role: "user" | "admin";
  createdAt: string;
  stage: string;
}

async function readErrorMessage(res: Response, fallback: string) {
  try {
    const data = (await res.json()) as { error?: unknown };
    return typeof data.error === "string" && data.error ? data.error : fallback;
  } catch {
    return fallback;
  }
}

export default function AccountPage() {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [nickname, setNickname] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [confirmText, setConfirmText] = useState("");
  const [deleteMsg, setDeleteMsg] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/account");
      if (!res.ok) {
        setError(await readErrorMessage(res, "加载失败"));
        return;
      }
      const data = (await res.json()) as Account;
      setAccount(data);
      setNickname(data.nickname);
    } catch {
      setError("加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg("");
    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname }),
      });
      if (!res.ok) {
        setProfileMsg(await readErrorMessage(res, "保存失败"));
        return;
      }
      setProfileMsg("已保存");
      void load();
    } catch {
      setProfileMsg("保存失败");
    } finally {
      setProfileSaving(false);
    }
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMsg("");
    try {
      const res = await fetch("/api/account/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        setPasswordMsg(await readErrorMessage(res, "修改失败"));
        return;
      }
      setPasswordMsg("密码已更新");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setPasswordMsg("修改失败");
    } finally {
      setPasswordSaving(false);
    }
  }

  async function deleteAccount(e: FormEvent) {
    e.preventDefault();
    if (confirmText !== "删除账号") {
      setDeleteMsg("请输入 删除账号 确认");
      return;
    }
    setDeleting(true);
    setDeleteMsg("");
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmText }),
      });
      if (!res.ok) {
        setDeleteMsg(await readErrorMessage(res, "删除失败"));
        return;
      }
      router.push("/login");
      router.refresh();
    } catch {
      setDeleteMsg("删除失败");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50/40 p-6">
        <p className="text-sm text-stone-500">加载中…</p>
      </main>
    );
  }

  if (error || !account) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50/40 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm shadow-orange-100/50">
          <p className="text-sm text-red-600">{error || "用户不存在"}</p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-orange-600 hover:underline"
          >
            返回首页
          </Link>
        </div>
      </main>
    );
  }

  const avatarUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(
    account.avatarSeed || account.email,
  )}`;

  return (
    <main className="min-h-screen bg-orange-50/40 px-6 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm shadow-orange-100/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl}
            alt="头像"
            className="h-16 w-16 rounded-2xl bg-orange-100"
          />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-stone-900">
              {account.nickname}
            </h1>
            <p className="truncate text-sm text-stone-500">{account.email}</p>
            <div className="mt-1 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-orange-100 px-2 py-0.5 font-medium text-orange-700">
                {account.stage}
              </span>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 font-medium text-stone-600">
                {account.role === "admin" ? "管理员" : "普通用户"}
              </span>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 font-medium text-stone-600">
                注册于 {new Date(account.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <form
          onSubmit={saveProfile}
          className="space-y-4 rounded-2xl bg-white p-6 shadow-sm shadow-orange-100/50"
        >
          <h2 className="text-lg font-semibold text-stone-900">个人资料</h2>
          <label className="block text-sm font-medium text-stone-700">
            昵称
            <input
              className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </label>
          {profileMsg && (
            <p className="text-sm text-stone-600">{profileMsg}</p>
          )}
          <button
            disabled={profileSaving}
            className="rounded-xl bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {profileSaving ? "保存中…" : "保存"}
          </button>
        </form>

        <form
          onSubmit={savePassword}
          className="space-y-4 rounded-2xl bg-white p-6 shadow-sm shadow-orange-100/50"
        >
          <h2 className="text-lg font-semibold text-stone-900">修改密码</h2>
          <label className="block text-sm font-medium text-stone-700">
            当前密码
            <input
              className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            新密码（至少 8 位）
            <input
              className="mt-1 w-full rounded-xl border border-orange-200 px-3 py-2 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
            />
          </label>
          {passwordMsg && (
            <p className="text-sm text-stone-600">{passwordMsg}</p>
          )}
          <button
            disabled={passwordSaving}
            className="rounded-xl bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {passwordSaving ? "保存中…" : "更新密码"}
          </button>
        </form>

        <form
          onSubmit={deleteAccount}
          className="space-y-4 rounded-2xl border border-red-200 bg-red-50/50 p-6"
        >
          <h2 className="text-lg font-semibold text-red-700">删除账号</h2>
          <p className="text-sm text-stone-600">
            此操作不可恢复。请输入{" "}
            <span className="font-semibold text-red-700">删除账号</span> 以确认。
          </p>
          <input
            className="w-full rounded-xl border border-red-300 px-3 py-2 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="删除账号"
          />
          {deleteMsg && (
            <p className="text-sm text-red-600">{deleteMsg}</p>
          )}
          <button
            disabled={deleting}
            className="rounded-xl bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "删除中…" : "永久删除账号"}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-orange-600 hover:underline"
          >
            返回首页
          </Link>
        </div>
      </div>
    </main>
  );
}
