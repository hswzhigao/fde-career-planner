"use client";

import { useEffect, useState } from "react";
import { CHECKLIST_SECTIONS } from "@/lib/constants/job-checklist";

interface ChecklistItem {
  id: number;
  section: string;
  title: string;
  is_done: boolean;
  notes: string | null;
  sort_order: number;
}

export default function JobChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState<{ section: string; title: string }>({ section: "resume", title: "" });

  const load = () => {
    fetch("/api/job-prep")
      .then((r) => r.json())
      .then((d) => {
        setItems(d);
        setLoading(false);
      });
  };

  useEffect(() => load(), []);

  const toggle = async (item: ChecklistItem) => {
    await fetch("/api/job-prep", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, is_done: !item.is_done }),
    });
    load();
  };

  const remove = async (id: number) => {
    await fetch(`/api/job-prep?id=${id}`, { method: "DELETE" });
    load();
  };

  const add = async () => {
    if (!newItem.title.trim()) return;
    await fetch("/api/job-prep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newItem, is_done: false }),
    });
    setNewItem({ section: newItem.section, title: "" });
    load();
  };

  if (loading) return <div className="text-gray-500">加载中…</div>;

  const totalDone = items.filter((i) => i.is_done).length;
  const overallProgress = items.length > 0 ? (totalDone / items.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">整体完成率</h2>
          <span className="text-sm text-gray-500">{totalDone}/{items.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
        </div>
      </div>

      {/* Sections */}
      {CHECKLIST_SECTIONS.map((section) => {
        const sectionItems = items.filter((i) => i.section === section.key);
        const doneCount = sectionItems.filter((i) => i.is_done).length;

        return (
          <div key={section.key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{section.label}</h2>
              <span className="text-sm text-gray-500">{doneCount}/{sectionItems.length}</span>
            </div>
            <div className="space-y-2">
              {sectionItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 group">
                  <button
                    onClick={() => toggle(item)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${
                      item.is_done ? "bg-green-500 border-green-500 text-white" : "border-gray-300 hover:border-brand-400"
                    }`}
                  >
                    {item.is_done ? "✓" : ""}
                  </button>
                  <span className={`text-sm flex-1 ${item.is_done ? "line-through text-gray-400" : "text-gray-700"}`}>
                    {item.title}
                  </span>
                  <button
                    onClick={() => remove(item.id)}
                    className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>

            {/* Add new item */}
            <div className="mt-4 flex gap-2">
              <select
                value={newItem.section === section.key ? newItem.section : newItem.section}
                onChange={(e) => setNewItem({ section: e.target.value, title: newItem.title })}
                className="hidden"
              />
              <input
                type="text"
                value={newItem.section === section.key ? newItem.title : ""}
                onChange={(e) => setNewItem({ section: section.key, title: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && add()}
                placeholder={`添加${section.label}项…`}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
              />
              <button
                onClick={add}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
              >
                添加
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
