import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { getSessionFromCookies } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "FDE 个人规划工作台",
  description: "程序员转型 Forward Deployed Engineer 的个人规划工作台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Public paths (/login, /register) are only ever served to unauthenticated
  // users (middleware redirects authenticated users away from them), and every
  // protected path is only served to authenticated users (middleware redirects
  // unauthenticated users to /login). So the presence of a session cookie is a
  // reliable signal for which shell to render.
  const session = getSessionFromCookies();

  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        {session ? (
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex min-h-screen flex-1 flex-col">
              <TopBar />
              <main className="flex-1 overflow-x-auto bg-orange-50/40 p-8">
                {children}
              </main>
            </div>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
