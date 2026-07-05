"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AIStreamPanel from "./AIStreamPanel";

interface Profile {
  id: number;
  current_role: string;
  years_of_experience: number;
  tech_stack: string;
  project_experience: string;
  has_customer_communication: boolean;
  has_tob_delivery: boolean;
  has_ai_experience: boolean;
  can_travel: boolean;
  target_role_type: string;
  target_salary: string;
  weekly_study_hours: number;
  preferred_industries: string;
}

const EMPTY: Partial<Profile> = {
  current_role: "",
  years_of_experience: 0,
  tech_stack: "",
  project_experience: "",
  has_customer_communication: false,
  has_tob_delivery: false,
  has_ai_experience: false,
  can_travel: false,
  target_role_type: "",
  target_salary: "",
  weekly_study_hours: 10,
  preferred_industries: "",
};

export default function ProfileForm() {
  const router = useRouter();
  const [form, setForm] = useState<Partial<Profile>>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        setForm({ ...EMPTY, ...d });
        setLoading(false);
      });
  }, []);

  const update = (key: keyof Profile, val: string | number | boolean) => {
    setForm((f) => ({ ...f, [key]: val }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  };

  if (loading) return <div className="text-gray-500">加载中…</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">基本信息</h2>

        <Field label="当前岗位">
          <input
            type="text"
            value={form.current_role || ""}
            onChange={(e) => update("current_role", e.target.value)}
            placeholder="如：后端开发工程师"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="工作年限">
            <input
              type="number"
              value={form.years_of_experience || 0}
              onChange={(e) => update("years_of_experience", parseInt(e.target.value) || 0)}
              className={inputCls}
            />
          </Field>
          <Field label="每周学习时间（小时）">
            <input
              type="number"
              value={form.weekly_study_hours || 0}
              onChange={(e) => update("weekly_study_hours", parseInt(e.target.value) || 0)}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="技术栈">
          <input
            type="text"
            value={form.tech_stack || ""}
            onChange={(e) => update("tech_stack", e.target.value)}
            placeholder="如：Java, Python, MySQL, React"
            className={inputCls}
          />
        </Field>

        <Field label="项目经历">
          <textarea
            value={form.project_experience || ""}
            onChange={(e) => update("project_experience", e.target.value)}
            rows={4}
            placeholder="简要描述你做过的关键项目"
            className={inputCls}
          />
        </Field>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">经验标签</p>
          <Checkbox
            checked={!!form.has_customer_communication}
            onChange={(v) => update("has_customer_communication", v)}
            label="做过客户沟通"
          />
          <Checkbox
            checked={!!form.has_tob_delivery}
            onChange={(v) => update("has_tob_delivery", v)}
            label="做过 ToB / 交付 / 售前 / 实施"
          />
          <Checkbox
            checked={!!form.has_ai_experience}
            onChange={(v) => update("has_ai_experience", v)}
            label="做过 AI / RAG / Agent"
          />
          <Checkbox
            checked={!!form.can_travel}
            onChange={(v) => update("can_travel", v)}
            label="可以接受出差"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">目标与偏好</h2>

        <Field label="目标岗位类型">
          <input
            type="text"
            value={form.target_role_type || ""}
            onChange={(e) => update("target_role_type", e.target.value)}
            placeholder="如：AI 应用交付 FDE / 大模型应用工程师"
            className={inputCls}
          />
        </Field>

        <Field label="目标薪资">
          <input
            type="text"
            value={form.target_salary || ""}
            onChange={(e) => update("target_salary", e.target.value)}
            placeholder="如：25k-40k"
            className={inputCls}
          />
        </Field>

        <Field label="偏好行业方向">
          <input
            type="text"
            value={form.preferred_industries || ""}
            onChange={(e) => update("preferred_industries", e.target.value)}
            placeholder="如：金融, 制造, 医疗, SaaS"
            className={inputCls}
          />
        </Field>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="px-6 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 disabled:opacity-50 font-medium text-sm"
        >
          {saving ? "保存中…" : "保存"}
        </button>
        {saved && <span className="text-sm text-green-600">已保存 ✓</span>}
      </div>

      {/* AI Summary - streaming */}
      <AIStreamPanel
        title="AI 画像总结"
        buttonLabel="AI 一键生成画像总结"
        apiEndpoint="/api/ai/summarize-profile"
        accentColor="purple"
      />
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}
