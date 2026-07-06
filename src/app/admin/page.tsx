"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  userCount: number;
  activeUserCount: number;
  learningTaskCount: number;
  aiSummaryCount: number;
}

interface AdminUser {
  id: number;
  email: string;
  nickname: string;
  avatarSeed: string;
  role: string;
  createdAt: string;
}

interface UsersResponse {
  users: AdminUser[];
  page: number;
  pageSize: number;
  total: number;
}

interface Account {
  id: number;
  role: "user" | "admin";
}

async function readErrorMessage(res: Response, fallback: string) {
  try {
    const data = (await res.json()) as { error?: unknown };
    return typeof data.error === "string" && data.error ? data.error : fallback;
  } catch {
    return fallback;
  }
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");

  async function loadData(targetPage: number) {
    setLoading(true);
    setError("");
    try {
      const [statsRes, usersRes, accountRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch(`/api/admin/users?page=${targetPage}&pageSize=${pageSize}`),
        fetch("/api/account"),
      ]);

      if (!statsRes.ok) {
        setError(await readErrorMessage(statsRes, "加载统计失败"));
        return;
      }
      if (!usersRes.ok) {
        setError(await readErrorMessage(usersRes, "加载用户失败"));
        return;
      }
      setStats((await statsRes.json()) as Stats);
      const usersData = (await usersRes.json()) as UsersResponse;
      setUsers(usersData.users);
      setPage(usersData.page);
      setTotal(usersData.total);
      if (accountRes.ok) {
        const account = (await accountRes.json()) as Account;
        setCurrentUserId(account.id);
      }
    } catch {
      setError("加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function deleteUser(id: number) {
    if (id === currentUserId) {
      setActionError("不能删除自己");
      return;
    }
    if (!window.confirm("确定删除该用户？此操作不可恢复。")) return;
    setDeletingId(id);
    setActionError("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setActionError(await readErrorMessage(res, "删除失败"));
        return;
      }
      await loadData(page);
    } catch {
      setActionError("删除失败");
    } finally {
      setDeletingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (loading && !stats) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50/40 p-6">
        <p className="text-sm text-stone-500">加载中…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50/40 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm shadow-orange-100/50">
          <p className="text-sm text-red-600">{error}</p>
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

  const statCards: { label: string; value: number; hint: string }[] = [
    { label: "用户总数", value: stats?.userCount ?? 0, hint: "全部注册用户" },
    {
      label: "近 7 天活跃",
      value: stats?.activeUserCount ?? 0,
      hint: "7 天内注册",
    },
    {
      label: "学习任务",
      value: stats?.learningTaskCount ?? 0,
      hint: "全部学习任务",
    },
    {
      label: "AI 摘要",
      value: stats?.aiSummaryCount ?? 0,
      hint: "全部 AI 摘要",
    },
  ];

  return (
    <main className="min-h-screen bg-orange-50/40 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-stone-900">管理后台</h1>
          <Link
            href="/"
            className="text-sm text-orange-600 hover:underline"
          >
            返回首页
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl bg-white p-5 shadow-sm shadow-orange-100/50"
            >
              <p className="text-sm font-medium text-stone-500">{card.label}</p>
              <p className="mt-2 text-3xl font-bold text-stone-900">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-stone-400">{card.hint}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm shadow-orange-100/50">
          <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-stone-900">
              用户列表
              <span className="ml-2 text-sm font-normal text-stone-400">
                共 {total} 人
              </span>
            </h2>
          </div>

          {actionError && (
            <p className="px-6 pt-4 text-sm text-red-600">{actionError}</p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-orange-50/60 text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-6 py-3 font-medium">用户</th>
                  <th className="px-6 py-3 font-medium">角色</th>
                  <th className="px-6 py-3 font-medium">注册时间</th>
                  <th className="px-6 py-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-stone-400"
                    >
                      暂无用户
                    </td>
                  </tr>
                )}
                {users.map((u) => {
                  const isSelf = u.id === currentUserId;
                  return (
                    <tr key={u.id} className="hover:bg-orange-50/30">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(
                              u.avatarSeed || u.email,
                            )}`}
                            alt=""
                            className="h-8 w-8 rounded-lg bg-orange-100"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-stone-900">
                              {u.nickname || u.email.split("@")[0]}
                            </p>
                            <p className="truncate text-xs text-stone-400">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            u.role === "admin"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {u.role === "admin" ? "管理员" : "普通用户"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-stone-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          disabled={isSelf || deletingId === u.id}
                          onClick={() => deleteUser(u.id)}
                          className={`rounded-lg px-3 py-1 text-xs font-medium ${
                            isSelf
                              ? "cursor-not-allowed bg-stone-100 text-stone-400"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          } disabled:opacity-50`}
                        >
                          {isSelf
                            ? "当前账号"
                            : deletingId === u.id
                              ? "删除中…"
                              : "删除"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-stone-100 px-6 py-4 text-sm">
              <span className="text-stone-500">
                第 {page} / {totalPages} 页
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => loadData(page - 1)}
                  className="rounded-lg border border-orange-200 px-3 py-1 text-stone-600 hover:bg-orange-50 disabled:opacity-50"
                >
                  上一页
                </button>
                <button
                  disabled={page >= totalPages || loading}
                  onClick={() => loadData(page + 1)}
                  className="rounded-lg border border-orange-200 px-3 py-1 text-stone-600 hover:bg-orange-50 disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
