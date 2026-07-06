"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "仪表盘" },
  { href: "/profile", label: "个人画像" },
  { href: "/skills", label: "技能自评" },
  { href: "/gap-analysis", label: "差距分析" },
  { href: "/learning", label: "学习路线" },
  { href: "/weekly", label: "每周追踪" },
  { href: "/job-prep", label: "求职准备" },
  { href: "/chat", label: "FDE 顾问" },
  { href: "/export", label: "总结导出" },
  { href: "/account", label: "账号设置" },
];

const ADMIN_ITEMS = [{ href: "/admin", label: "管理后台" }];

interface AccountInfo {
  role?: "user" | "admin";
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/account")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: AccountInfo | null) => {
        if (active && data?.role === "admin") setIsAdmin(true);
      })
      .catch(() => {
        /* unauthenticated or transient — keep admin link hidden */
      });
    return () => {
      active = false;
    };
  }, []);

  const items = isAdmin ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS;

  return (
    <nav className="w-56 shrink-0 border-r border-orange-100 bg-white min-h-screen">
      <div className="p-6 border-b border-orange-100">
        <Link href="/" className="block">
          <h1 className="text-lg font-bold text-stone-900">FDE 工作台</h1>
          <p className="text-xs text-stone-500 mt-1">个人规划 · 转型追踪</p>
        </Link>
      </div>
      <ul className="py-2">
        {items.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-6 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-orange-50 text-orange-700 font-medium border-r-2 border-orange-500"
                    : "text-stone-600 hover:bg-orange-50/40 hover:text-stone-900"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
