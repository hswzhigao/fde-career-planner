"use client";

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
  { href: "/export", label: "总结导出" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0 border-r border-gray-200 bg-white min-h-screen">
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="block">
          <h1 className="text-lg font-bold text-gray-900">FDE 工作台</h1>
          <p className="text-xs text-gray-500 mt-1">个人规划 · 转型追踪</p>
        </Link>
      </div>
      <ul className="py-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-6 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-700 font-medium border-r-2 border-brand-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
