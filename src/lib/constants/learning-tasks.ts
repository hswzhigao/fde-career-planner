// 默认学习任务骨架

export interface LearningTaskTemplate {
  phase: string;
  title: string;
  category: string;
  priority: string;
}

export const DEFAULT_LEARNING_TASKS: LearningTaskTemplate[] = [
  // 30 天：基础补齐
  { phase: "30", title: "阅读 10 个 FDE / AI 解决方案 JD", category: "delivery", priority: "high" },
  { phase: "30", title: "学习 RAG 基础（chunking/embedding/检索）", category: "ai_engineering", priority: "high" },
  { phase: "30", title: "练习 LLM API + tool calling", category: "ai_engineering", priority: "high" },
  { phase: "30", title: "编写客户需求访谈问题清单", category: "delivery", priority: "medium" },
  { phase: "30", title: "学习业务指标体系（效率/成本/收入/风险）", category: "business", priority: "medium" },

  // 60 天：项目实战
  { phase: "60", title: "做企业 RAG 知识助手项目", category: "ai_engineering", priority: "high" },
  { phase: "60", title: "做业务流程自动化 Demo", category: "delivery", priority: "high" },
  { phase: "60", title: "搭建 evals 评测体系", category: "ai_engineering", priority: "medium" },
  { phase: "60", title: "练习客户方案文档写作", category: "delivery", priority: "medium" },
  { phase: "60", title: "拆解一个行业的核心业务流程", category: "business", priority: "medium" },

  // 90 天：作品集与求职
  { phase: "90", title: "做行业 AI 解决方案 Demo", category: "ai_engineering", priority: "high" },
  { phase: "90", title: "改写简历为 FDE 叙事", category: "delivery", priority: "high" },
  { phase: "90", title: "准备 5 分钟 Demo Presentation", category: "delivery", priority: "high" },
  { phase: "90", title: "准备面试题（系统设计+客户场景）", category: "delivery", priority: "medium" },
  { phase: "90", title: "整理行为面试故事库", category: "business", priority: "medium" },
];
