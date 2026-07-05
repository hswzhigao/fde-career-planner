"use client";

import { useEffect, useState } from "react";
import { buildExportText, buildMarkdown } from "@/lib/export";

export default function ExportView() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/skills").then((r) => r.json()),
      fetch("/api/learning").then((r) => r.json()),
      fetch("/api/weekly").then((r) => r.json()),
      fetch("/api/job-prep").then((r) => r.json()),
    ]).then(([profile, skills, tasks, weekly, checklist]) => {
      const scores: Record<string, number> = {};
      skills.forEach((s: { key: string; score: number }) => (scores[s.key] = s.score));

      const t = buildExportText({
        profile,
        scores,
        learningProgress: { total: tasks.length, done: tasks.filter((t: { status: string }) => t.status === "done").length },
        weeklyCount: weekly.length,
        jobPrepProgress: { total: checklist.length, done: checklist.filter((c: { is_done: boolean }) => c.is_done).length },
      });
      setText(t);
      setLoading(false);
    });
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const download = () => {
    const md = buildMarkdown({
      profile: null,
      scores: {},
      learningProgress: { total: 0, done: 0 },
      weeklyCount: 0,
      jobPrepProgress: { total: 0, done: 0 },
    });
    // Use current text instead
    const blob = new Blob([`# FDE 个人规划摘要\n\n生成时间：${new Date().toLocaleString("zh-CN")}\n\n${text}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fde-plan-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const runAI = async () => {
    setAiLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/generate-report", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAiResult(data.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知错误");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="text-gray-500">加载中…</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">可复制文本摘要</h2>
          <div className="flex gap-2">
            <button onClick={copy} className="px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700">
              {copied ? "已复制 ✓" : "复制"}
            </button>
            <button onClick={download} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200">
              下载 Markdown
            </button>
          </div>
        </div>
        <pre className="bg-gray-50 p-4 rounded text-sm text-gray-700 whitespace-pre-wrap font-mono">{text}</pre>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">AI 完整规划报告</h2>
          <button
            onClick={runAI}
            disabled={aiLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 font-medium text-sm"
          >
            {aiLoading ? "AI 生成中…" : "AI 生成规划报告"}
          </button>
        </div>
        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
        {aiResult && (
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{aiResult}</div>
        )}
      </div>
    </div>
  );
}
