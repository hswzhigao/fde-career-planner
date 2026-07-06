"use client";

import { useEffect, useState } from "react";
import AIStreamPanel from "./AIStreamPanel";

interface Task {
  id: number;
  phase: string;
  title: string;
  category: string;
  priority: string;
  status: string;
}

const PHASES = [
  { key: "30", label: "30 天 · 基础补齐" },
  { key: "60", label: "60 天 · 项目实战" },
  { key: "90", label: "90 天 · 作品集与求职" },
];

const CAT_LABELS: Record<string, string> = {
  delivery: "客户交付",
  ai_engineering: "AI 工程",
  business: "业务理解",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-gray-100 text-stone-600",
};

export default function LearningBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = () => {
    fetch("/api/learning")
      .then((r) => r.json())
      .then((d) => {
        setTasks(d);
        setLoading(false);
      });
  };

  useEffect(() => load(), []);

  const toggleStatus = async (task: Task) => {
    const next = task.status === "done" ? "pending" : task.status === "pending" ? "in_progress" : "done";
    await fetch("/api/learning", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, status: next }),
    });
    load();
  };

  const deleteTask = async (id: number) => {
    await fetch(`/api/learning?id=${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <div className="text-stone-500">加载中…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-white border border-gray-300 text-stone-700 rounded-xl hover:bg-orange-50/40 font-medium text-sm"
        >
          {showAdd ? "取消" : "手动添加任务"}
        </button>
      </div>

      {showAdd && <AddTaskForm onAdded={load} onCancel={() => setShowAdd(false)} />}

      {PHASES.map((phase) => {
        const phaseTasks = tasks.filter((t) => t.phase === phase.key);
        const doneCount = phaseTasks.filter((t) => t.status === "done").length;
        const progress = phaseTasks.length > 0 ? (doneCount / phaseTasks.length) * 100 : 0;

        return (
          <div key={phase.key} className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-stone-900">{phase.label}</h2>
              <span className="text-sm text-stone-500">{doneCount}/{phaseTasks.length}</span>
            </div>
            <div className="w-full bg-orange-100 rounded-full h-2 mb-4">
              <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="space-y-2">
              {phaseTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 group">
                  <button
                    onClick={() => toggleStatus(task)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${
                      task.status === "done"
                        ? "bg-green-500 border-green-500 text-white"
                        : task.status === "in_progress"
                        ? "bg-amber-100 border-amber-400"
                        : "border-gray-300 hover:border-orange-400"
                    }`}
                  >
                    {task.status === "done" ? "✓" : task.status === "in_progress" ? "…" : ""}
                  </button>
                  <span className={`text-sm flex-1 ${task.status === "done" ? "line-through text-stone-400" : "text-stone-700"}`}>
                    {task.title}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${PRIORITY_COLORS[task.priority] || ""}`}>
                    {task.priority}
                  </span>
                  <span className="text-xs text-stone-400">{CAT_LABELS[task.category] || task.category}</span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    删除
                  </button>
                </div>
              ))}
              {phaseTasks.length === 0 && <p className="text-sm text-stone-400">暂无任务</p>}
            </div>
          </div>
        );
      })}

      <AIStreamPanel
        title="AI 生成学习计划"
        buttonLabel="AI 生成学习计划"
        apiEndpoint="/api/ai/generate-plan"
        accentColor="purple"
        onComplete={load}
      />
    </div>
  );
}

function AddTaskForm({ onAdded, onCancel }: { onAdded: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [phase, setPhase] = useState("30");
  const [category, setCategory] = useState("ai_engineering");
  const [priority, setPriority] = useState("medium");

  const submit = async () => {
    if (!title.trim()) return;
    await fetch("/api/learning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, phase, category, priority, status: "pending" }),
    });
    setTitle("");
    onAdded();
    onCancel();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 space-y-4">
      <h3 className="font-medium text-stone-900">添加任务</h3>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="任务名称"
        className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
      />
      <div className="flex gap-4">
        <select value={phase} onChange={(e) => setPhase(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-xl text-sm">
          <option value="30">30 天</option>
          <option value="60">60 天</option>
          <option value="90">90 天</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-xl text-sm">
          <option value="delivery">客户交付</option>
          <option value="ai_engineering">AI 工程</option>
          <option value="business">业务理解</option>
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-xl text-sm">
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>
        <button onClick={submit} className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium">
          添加
        </button>
      </div>
    </div>
  );
}
