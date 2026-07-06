"use client";

import { usePathname } from "next/navigation";
import UserMenu from "@/components/UserMenu";

const PAGE_TITLES: Record<string, string> = {
  "/": "仪表盘",
  "/profile": "个人画像",
  "/skills": "技能自评",
  "/gap-analysis": "差距分析",
  "/learning": "学习路线",
  "/weekly": "每周追踪",
  "/job-prep": "求职准备",
  "/chat": "FDE 顾问",
  "/export": "总结导出",
  "/account": "账号设置",
  "/admin": "管理后台",
};

function currentTitle(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const match = Object.keys(PAGE_TITLES)
    .filter((href) => href !== "/" && pathname.startsWith(href))
    .sort((a, b) => b.length - a.length)[0];
  return match ? PAGE_TITLES[match] : "FDE 工作台";
}

export default function TopBar() {
  const pathname = usePathname();
  const title = currentTitle(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-orange-100 bg-white px-6">
      <h2 className="text-base font-semibold text-stone-900">{title}</h2>
      <UserMenu />
    </header>
  );
}
