// 求职准备清单默认模板

export interface ChecklistTemplate {
  section: string;
  title: string;
  sort_order: number;
}

export const DEFAULT_CHECKLIST: ChecklistTemplate[] = [
  // 简历 6 项
  { section: "resume", title: "FDE 方向 summary", sort_order: 1 },
  { section: "resume", title: "客户交付项目", sort_order: 2 },
  { section: "resume", title: "AI 工程项目", sort_order: 3 },
  { section: "resume", title: "业务指标量化", sort_order: 4 },
  { section: "resume", title: "Demo 链接", sort_order: 5 },
  { section: "resume", title: "架构图", sort_order: 6 },

  // 作品集 5 项
  { section: "portfolio", title: "企业 RAG 知识助手", sort_order: 1 },
  { section: "portfolio", title: "业务流程自动化", sort_order: 2 },
  { section: "portfolio", title: "行业 AI 方案", sort_order: 3 },
  { section: "portfolio", title: "演示视频", sort_order: 4 },
  { section: "portfolio", title: "PoC 文档", sort_order: 5 },

  // 面试 5 项
  { section: "interview", title: "系统设计", sort_order: 1 },
  { section: "interview", title: "RAG / Agent", sort_order: 2 },
  { section: "interview", title: "客户需求澄清", sort_order: 3 },
  { section: "interview", title: "Demo Presentation", sort_order: 4 },
  { section: "interview", title: "行为面试故事库", sort_order: 5 },

  // 薪资 1 项
  { section: "salary", title: "确定薪资预期范围", sort_order: 1 },
];

export const CHECKLIST_SECTIONS = [
  { key: "resume", label: "简历" },
  { key: "portfolio", label: "作品集" },
  { key: "interview", label: "面试" },
  { key: "salary", label: "薪资" },
] as const;
