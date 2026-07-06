"use client";

import { useEffect, useState } from "react";
import AIStreamPanel from "./AIStreamPanel";

interface WeeklyLog {
  id: number;
  week_number: number;
  learned: string;
  project_progress: string;
  problems: string;
  delivery_practice: number;
  ai_practice: number;
  business_practice: number;
  next_week_plan: string;
  created_at: string;
}

export default function WeeklyForm() {
  const [logs, setLogs] = useState<WeeklyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    learned: "",
    project_progress: "",
    problems: "",
    delivery_practice: 1,
    ai_practice: 1,
    business_practice: 1,
    next_week_plan: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedAI, setExpandedAI] = useState<number | null>(null);

  const load = () => {
    fetch("/api/weekly")
      .then((r) => r.json())
      .then((d) => {
        setLogs(d);
        setLoading(false);
      });
  };

  useEffect(() => load(), []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/weekly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setForm({
      learned: "",
      project_progress: "",
      problems: "",
      delivery_practice: 1,
      ai_practice: 1,
      business_practice: 1,
      next_week_plan: "",
    });
    load();
    setTimeout(() => setSaved(false), 3000);
  };

  const runAI = async (logId: number) => {
    setExpandedAI(expandedAI === logId ? null : logId);
  };

  if (loading) return <div className="text-stone-500">加载中…</div>;

  return (
    <div className="space-y-6">
      {/* Current week form */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-stone-900">本周记录（第 {logs.length + 1} 周）</h2>

        <Field label="本周学习">
          <textarea value={form.learned} onChange={(e) => setForm({ ...form, learned: e.target.value })} rows={3} className={inputCls} />
        </Field>
        <Field label="项目进展">
          <textarea value={form.project_progress} onChange={(e) => setForm({ ...form, project_progress: e.target.value })} rows={3} className={inputCls} />
        </Field>
        <Field label="遇到的问题">
          <textarea value={form.problems} onChange={(e) => setForm({ ...form, problems: e.target.value })} rows={2} className={inputCls} />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <ScoreInput label="客户交付" value={form.delivery_practice} onChange={(v) => setForm({ ...form, delivery_practice: v })} />
          <ScoreInput label="AI 工程" value={form.ai_practice} onChange={(v) => setForm({ ...form, ai_practice: v })} />
          <ScoreInput label="业务理解" value={form.business_practice} onChange={(v) => setForm({ ...form, business_practice: v })} />
        </div>

        <Field label="下周计划">
          <textarea value={form.next_week_plan} onChange={(e) => setForm({ ...form, next_week_plan: e.target.value })} rows={2} className={inputCls} />
        </Field>

        <div className="flex items-center gap-4">
          <button onClick={save} disabled={saving} className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 font-medium text-sm">
            {saving ? "保存中…" : "保存周报"}
          </button>
          {saved && <span className="text-sm text-green-600">已保存 ✓</span>}
        </div>
      </div>

      {/* History */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-stone-900">历史周报</h2>
        {logs.length === 0 && <p className="text-sm text-stone-400">暂无历史记录</p>}
        {logs.map((log) => (
          <div key={log.id} className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-stone-900">第 {log.week_number} 周</h3>
              <span className="text-xs text-stone-400">{new Date(log.created_at).toLocaleDateString("zh-CN")}</span>
            </div>
            <div className="flex gap-4 text-sm">
              <span>交付 {log.delivery_practice}/5</span>
              <span>AI {log.ai_practice}/5</span>
              <span>业务 {log.business_practice}/5</span>
            </div>
            {log.learned && <p className="text-sm text-stone-600"><b>学习：</b>{log.learned}</p>}
            {log.project_progress && <p className="text-sm text-stone-600"><b>项目：</b>{log.project_progress}</p>}
            {log.problems && <p className="text-sm text-stone-600"><b>问题：</b>{log.problems}</p>}
            {log.next_week_plan && <p className="text-sm text-stone-600"><b>下周：</b>{log.next_week_plan}</p>}
            <button
              onClick={() => runAI(log.id)}
              className="text-xs px-3 py-1 bg-purple-50 text-purple-700 rounded border border-purple-200 hover:bg-purple-100"
            >
              {expandedAI === log.id ? "收起 AI 分析" : "AI 分析周报"}
            </button>
            {expandedAI === log.id && (
              <AIStreamPanel
                key={log.id}
                title={`第 ${log.week_number} 周 AI 分析`}
                buttonLabel="重新生成分析"
                apiEndpoint="/api/ai/review-weekly"
                body={{ logId: log.id }}
                accentColor="purple"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

function ScoreInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`w-8 h-8 rounded-xl text-sm font-medium ${value >= n ? "bg-orange-500 text-white" : "bg-gray-100 text-stone-400"}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
