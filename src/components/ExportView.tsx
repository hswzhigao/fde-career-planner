"use client";

import { useEffect, useState } from "react";
import { buildExportText } from "@/lib/export";
import AIStreamPanel from "./AIStreamPanel";

export default function ExportView() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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
    const blob = new Blob([`# FDE 个人规划摘要\n\n生成时间：${new Date().toLocaleString("zh-CN")}\n\n${text}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fde-plan-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
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

      <AIStreamPanel
        title="AI 完整规划报告"
        buttonLabel="AI 生成规划报告"
        apiEndpoint="/api/ai/generate-report"
        accentColor="purple"
      />
    </div>
  );
}
