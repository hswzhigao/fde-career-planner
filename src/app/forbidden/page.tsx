import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-orange-50/40 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm shadow-orange-100/50">
        <p className="text-5xl font-bold text-orange-500">403</p>
        <h1 className="mt-3 text-xl font-bold text-stone-900">无访问权限</h1>
        <p className="mt-2 text-sm text-stone-500">
          抱歉，你没有权限访问此页面。
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600"
        >
          返回首页
        </Link>
      </div>
    </main>
  );
}
