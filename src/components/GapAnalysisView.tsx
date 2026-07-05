"use client";

import { useEffect, useState } from "react";
import { SKILLS } from "@/lib/constants/skills";
import { getStrengthsAndWeaknesses, recommendPath } from "@/lib/gap-rules";
import AIStreamPanel from "./AIStreamPanel";

export default function GapAnalysisView() {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/skills")
      .then((r) => r.json())
      .then((data: { key: string; score: number }[]) => {
        const map: Record<string, number> = {};
        data.forEach((d) => (map[d.key] = d.score));
        setScores(map);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-gray-500">加载中…</div>;

  const { strengths, weaknesses } = getStrengthsAndWeaknesses(scores);
  const path = recommendPath(scores);

  return (
    <div className="space-y-6">
      {/* Rule-based analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">当前优势</h2>
          {strengths.length === 0 ? (
            <p className="text-sm text-gray-400">请先在技能自评页面打分</p>
          ) : (
            <ul className="space-y-2">
              {strengths.map((s) => (
                <li key={s.key} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{s.label}</span>
                  <span className="font-medium text-green-600">{s.score}/5</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">主要短板</h2>
          {weaknesses.length === 0 ? (
            <p className="text-sm text-gray-400">请先在技能自评页面打分</p>
          ) : (
            <ul className="space-y-2">
              {weaknesses.map((s) => (
                <li key={s.key} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{s.label}</span>
                  <span className={`font-medium ${s.score <= 2 ? "text-red-600" : "text-amber-600"}`}>{s.score}/5</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">推荐转型路径</h2>
        <p className="text-sm text-gray-700 bg-blue-50 p-4 rounded">{path}</p>
      </div>

      {/* AI Streaming Analysis */}
      <AIStreamPanel
        title="AI 深度差距分析"
        buttonLabel="AI 生成差距分析"
        apiEndpoint="/api/ai/analyze-gap"
        accentColor="purple"
      />
    </div>
  );
}
