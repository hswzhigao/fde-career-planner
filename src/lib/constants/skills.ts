// FDE 三大能力维度 × 21 项技能定义

export type SkillCategory = "delivery" | "ai_engineering" | "business";

export interface SkillDef {
  key: string;
  label: string;
  category: SkillCategory;
}

export const SKILL_CATEGORIES: Record<
  SkillCategory,
  { label: string; color: string }
> = {
  delivery: { label: "客户交付", color: "#3b82f6" },
  ai_engineering: { label: "AI 工程", color: "#10b981" },
  business: { label: "业务理解", color: "#f59e0b" },
};

export const SKILLS: SkillDef[] = [
  // 客户交付 7 项
  { key: "requirement_interview", label: "需求访谈", category: "delivery" },
  { key: "solution_presentation", label: "方案表达", category: "delivery" },
  { key: "poc_design", label: "PoC 设计", category: "delivery" },
  { key: "project_progression", label: "项目推进", category: "delivery" },
  { key: "customer_debugging", label: "客户排障", category: "delivery" },
  { key: "documentation", label: "文档能力", category: "delivery" },
  { key: "uat_launch", label: "UAT/上线", category: "delivery" },

  // AI 工程 8 项
  { key: "llm_api", label: "LLM API", category: "ai_engineering" },
  { key: "prompt_engineering", label: "Prompt", category: "ai_engineering" },
  { key: "rag", label: "RAG", category: "ai_engineering" },
  { key: "agent_workflow", label: "Agent/Workflow", category: "ai_engineering" },
  { key: "evals", label: "Evals 评测", category: "ai_engineering" },
  { key: "observability", label: "可观测性", category: "ai_engineering" },
  { key: "security_permission", label: "权限/安全", category: "ai_engineering" },
  { key: "deployment", label: "部署", category: "ai_engineering" },

  // 业务理解 6 项
  { key: "process_modeling", label: "业务流程建模", category: "business" },
  { key: "roi_metrics", label: "ROI 指标", category: "business" },
  { key: "industry_knowledge", label: "行业知识", category: "business" },
  { key: "data_metrics", label: "数据指标", category: "business" },
  { key: "customer_success", label: "客户成功", category: "business" },
  { key: "commercial_awareness", label: "商业意识", category: "business" },
];

export const SKILLS_BY_CATEGORY = (cat: SkillCategory) =>
  SKILLS.filter((s) => s.category === cat);

export const CATEGORY_LABELS = Object.fromEntries(
  Object.entries(SKILL_CATEGORIES).map(([k, v]) => [k, v.label]),
) as Record<SkillCategory, string>;
