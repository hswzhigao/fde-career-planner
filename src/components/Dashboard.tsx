"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardData {
  profile: Record<string, unknown> | null;
  skillSummary: { category: string; avg: number; label: string }[];
  phases: { phase: string; total: number; done: number; progress: number }[];
  latestWeekly: { week_number: number; learned: string } | null;
  weeklyCount: number;
  jobPrep: { total: number; done: number; progress: number };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading || !data) return <div className="text-stone-500">加载中…</div>;

  return (
    <div className="space-y-6">
      {/* Profile Overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <h2 className="text-lg font-semibold text-stone-900 mb-2">当前画像</h2>
        {data.profile && (data.profile.current_role || data.profile.years_of_experience) ? (
          <div className="text-sm text-stone-600">
            <span className="font-medium text-stone-900">{data.profile.current_role as string}</span>
            {" · "}
            <span>{data.profile.years_of_experience as number} 年经验</span>
            {" · "}
            <span>{(data.profile.target_role_type as string) || "目标未设定"}</span>
          </div>
        ) : (
          <Link href="/profile" className="text-sm text-orange-600 hover:underline">
            → 去填写个人画像
          </Link>
        )}
      </div>

      {/* Skill Scores */}
      <div className="grid grid-cols-3 gap-4">
        {data.skillSummary.map((s) => (
          <div key={s.category} className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 text-center">
            <div className={`text-3xl font-bold ${s.avg >= 3.5 ? "text-green-600" : s.avg >= 2.5 ? "text-amber-600" : "text-red-600"}`}>
              {s.avg}
            </div>
            <div className="text-sm text-stone-500 mt-1">{s.label}</div>
            <div className="text-xs text-stone-400">/ 5.0</div>
          </div>
        ))}
      </div>

      {/* Learning Progress */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-900">学习进度</h2>
          <Link href="/learning" className="text-sm text-orange-600 hover:underline">查看详情 →</Link>
        </div>
        <div className="space-y-3">
          {data.phases.map((p) => (
            <div key={p.phase}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-stone-600">{p.phase} 天阶段</span>
                <span className="text-stone-400">{p.done}/{p.total}</span>
              </div>
              <div className="w-full bg-orange-100 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly + Job Prep */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-900">最近周报</h2>
            <Link href="/weekly" className="text-sm text-orange-600 hover:underline">去记录 →</Link>
          </div>
          {data.latestWeekly ? (
            <div>
              <div className="text-sm font-medium text-stone-700">第 {data.latestWeekly.week_number} 周</div>
              <p className="text-sm text-stone-500 mt-1 line-clamp-2">{data.latestWeekly.learned || "无内容"}</p>
            </div>
          ) : (
            <p className="text-sm text-stone-400">暂无周报记录</p>
          )}
          <p className="text-xs text-stone-400 mt-2">共 {data.weeklyCount} 篇周报</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-900">求职准备</h2>
            <Link href="/job-prep" className="text-sm text-orange-600 hover:underline">查看 →</Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-stone-900">{data.jobPrep.progress}%</div>
            <div className="text-sm text-stone-500">{data.jobPrep.done}/{data.jobPrep.total} 项完成</div>
          </div>
          <div className="w-full bg-orange-100 rounded-full h-2 mt-3">
            <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${data.jobPrep.progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
