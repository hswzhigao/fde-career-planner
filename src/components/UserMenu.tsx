"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AccountInfo {
  nickname?: string;
  email?: string;
  avatarSeed?: string;
  role?: "user" | "admin";
}

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}`;
}

export default function UserMenu() {
  const router = useRouter();
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/account")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: AccountInfo | null) => {
        if (active && data) setAccount(data);
      })
      .catch(() => {
        /* unauthenticated — render nothing */
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  if (!account) {
    return null;
  }

  const seed = account.avatarSeed || account.nickname || account.email || "fde";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-orange-100 bg-white py-1 pl-1 pr-3 text-sm text-stone-700 transition-colors hover:bg-orange-50/40"
      >
        <img
          src={avatarUrl(seed)}
          alt="头像"
          width={28}
          height={28}
          className="h-7 w-7 rounded-full bg-orange-50"
        />
        <span className="max-w-[8rem] truncate">{account.nickname || account.email}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-orange-100 bg-white shadow-lg shadow-orange-100/40">
          <div className="border-b border-orange-100 px-4 py-3">
            <p className="truncate text-sm font-medium text-stone-900">
              {account.nickname || account.email}
            </p>
            {account.email && (
              <p className="truncate text-xs text-stone-500">{account.email}</p>
            )}
          </div>
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-orange-50/40"
          >
            账号设置
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="block w-full px-4 py-2.5 text-left text-sm text-stone-700 transition-colors hover:bg-orange-50/40 disabled:opacity-50"
          >
            {loggingOut ? "退出中…" : "退出登录"}
          </button>
        </div>
      )}
    </div>
  );
}
