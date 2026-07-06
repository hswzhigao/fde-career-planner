"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { SKILLS, SKILL_CATEGORIES, SKILLS_BY_CATEGORY, type SkillCategory } from "@/lib/constants/skills";

interface SkillRecord {
  key: string;
  label: string;
  category: SkillCategory;
  score: number;
}

const CATS: SkillCategory[] = ["delivery", "ai_engineering", "business"];

export default function SkillAssessment() {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/skills")
      .then((r) => r.json())
      .then((data: SkillRecord[]) => {
        const map: Record<string, number> = {};
        data.forEach((d) => {
          map[d.key] = d.score;
        });
        setScores(map);
        setLoading(false);
      });
  }, []);

  const setScore = (key: string, score: number) => {
    setScores((s) => ({ ...s, [key]: score }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    const payload = SKILLS.map((s) => ({
      skill_key: s.key,
      category: s.category,
      score: scores[s.key] ?? 0,
    }));
    await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setSaved(true);
  };

  const radarData = CATS.map((cat) => {
    const skills = SKILLS_BY_CATEGORY(cat);
    const filled = skills.filter((s) => (scores[s.key] ?? 0) > 0);
    const total = filled.reduce((sum, s) => sum + (scores[s.key] ?? 0), 0);
    const avg = filled.length > 0 ? total / filled.length : 0;
    return { category: SKILL_CATEGORIES[cat].label, score: Number(avg.toFixed(1)) };
  });

  if (loading) return <div className="text-stone-500">加载中…</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">能力雷达图</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 13, fill: "#374151" }} />
              <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
              <Radar
                dataKey="score"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex justify-around mt-2">
            {radarData.map((d) => (
              <div key={d.category} className="text-center">
                <div className="text-2xl font-bold" style={{ color: "#3b82f6" }}>{d.score}</div>
                <div className="text-xs text-stone-500">{d.category}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Score Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">短板排序</h2>
          <ShortList scores={scores} />
        </div>
      </div>

      {/* Skill Groups */}
      {CATS.map((cat) => {
        const skills = SKILLS_BY_CATEGORY(cat);
        const config = SKILL_CATEGORIES[cat];
        return (
          <div key={cat} className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
              <h2 className="text-lg font-semibold text-stone-900">{config.label}</h2>
              <span className="text-sm text-stone-400">({skills.length} 项)</span>
            </div>
            <div className="space-y-3">
              {skills.map((s) => (
                <div key={s.key} className="flex items-center justify-between">
                  <span className="text-sm text-stone-700 w-32">{s.label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setScore(s.key, n)}
                        className={`w-8 h-8 rounded-xl text-sm font-medium transition-colors ${
                          (scores[s.key] ?? 0) >= n
                            ? "text-white"
                            : "bg-gray-100 text-stone-400 hover:bg-gray-200"
                        }`}
                        style={
                          (scores[s.key] ?? 0) >= n
                            ? { backgroundColor: config.color }
                            : {}
                        }
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-4 sticky bottom-4 bg-white p-4 rounded-2xl shadow-md border border-orange-100">
        <button
          onClick={save}
          disabled={saving}
          className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 font-medium text-sm"
        >
          {saving ? "保存中…" : "保存评分"}
        </button>
        {saved && <span className="text-sm text-green-600">已保存 ✓</span>}
      </div>
    </div>
  );
}

function ShortList({ scores }: { scores: Record<string, number> }) {
  const items = SKILLS.map((s) => ({ ...s, score: scores[s.key] ?? 0 }))
    .filter((s) => s.score > 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, 8);

  if (items.length === 0) {
    return <p className="text-sm text-stone-400">尚未评分，请先在下方打分</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((s) => (
        <div key={s.key} className="flex items-center justify-between text-sm">
          <span className="text-stone-700">{s.label}</span>
          <span className={`font-medium ${s.score <= 2 ? "text-red-600" : s.score <= 3 ? "text-amber-600" : "text-green-600"}`}>
            {s.score}/5
          </span>
        </div>
      ))}
    </div>
  );
}
