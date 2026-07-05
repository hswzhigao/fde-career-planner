// FDE 职业转型顾问 system prompt + 各场景 prompt 构造

export const SYSTEM_PROMPT = `你是一位 FDE（Forward Deployed Engineer）职业转型顾问。

FDE 能力模型分三大类：
- 客户交付：需求访谈、方案表达、PoC 设计、项目推进、客户排障、文档能力、UAT/上线
- AI 工程：LLM API、Prompt、RAG、Agent/Workflow、Evals 评测、可观测性、权限安全、部署
- 业务理解：业务流程建模、ROI 指标、行业知识、数据指标、客户成功、商业意识

你的任务是根据用户数据，给出具体、可执行、结构化的建议。
回复使用中文，使用 Markdown 格式。`;

export function summarizeProfilePrompt(profile: Record<string, unknown>): string {
  return `请基于以下个人画像数据，生成一份结构化的个人画像总结。

要求：
1. 概括当前背景（岗位、年限、技术栈、经验）
2. 判断当前最接近的 FDE 转型路径类型
3. 指出已有优势
4. 指出明显短板
5. 给出初步建议方向

个人画像数据：
${JSON.stringify(profile, null, 2)}`;
}

export function analyzeGapPrompt(
  profile: Record<string, unknown>,
  skills: { key: string; label: string; category: string; score: number }[],
): string {
  const skillText = skills
    .map((s) => `${s.label} (${s.category}): ${s.score}/5`)
    .join("\n");

  return `请基于以下个人画像和技能评分，生成一份 FDE 差距分析。

要求输出以下部分：
## 当前优势
列出 3-5 项已经具备的优势

## 主要短板
按严重程度排序，列出 3-5 项短板

## 优先补齐清单
给出 4-6 项具体可执行的补齐建议，每项包含：做什么、为什么、预期效果

## 推荐转型路径
判断最适合的 FDE 转型路径类型并说明原因

个人画像：
${JSON.stringify(profile, null, 2)}

技能评分：
${skillText}`;
}

export function generatePlanPrompt(
  profile: Record<string, unknown>,
  skills: { key: string; label: string; category: string; score: number }[],
): string {
  const skillText = skills
    .map((s) => `${s.label}: ${s.score}/5`)
    .join(", ");

  return `请基于以下信息，生成一份 30/60/90 天 FDE 学习计划。

要求：
- 30 天阶段：3-5 个任务，聚焦基础补齐
- 60 天阶段：3-5 个任务，聚焦项目实战
- 90 天阶段：3-5 个任务，聚焦作品集和求职准备
- 每个任务包含：标题、分类（delivery/ai_engineering/business）、优先级（high/medium/low）

输出格式：JSON 数组，每个元素：{"phase":"30","title":"...","category":"...","priority":"high"}

个人画像：
${JSON.stringify(profile, null, 2)}

当前技能：
${skillText}`;
}

export function reviewWeeklyPrompt(
  log: Record<string, unknown>,
  history: { week_number: number; delivery_practice: number; ai_practice: number; business_practice: number }[],
): string {
  const historyText = history
    .map((h) => `第${h.week_number}周: 交付${h.delivery_practice} AI${h.ai_practice} 业务${h.business_practice}`)
    .join("\n");

  return `请分析以下周报数据，给出：
1. 本周进展评估
2. 能力训练趋势
3. 存在的问题
4. 下周建议（3-5 条具体建议）

本周周报：
${JSON.stringify(log, null, 2)}

历史评分：
${historyText || "暂无历史"}`;
}

export function generateReportPrompt(data: {
  profile: Record<string, unknown>;
  skills: { key: string; label: string; category: string; score: number }[];
  learningProgress: { total: number; done: number };
  weeklyCount: number;
  jobPrepProgress: { total: number; done: number };
}): string {
  const skillText = data.skills
    .map((s) => `${s.label}: ${s.score}/5`)
    .join(", ");

  return `请基于以下完整数据，生成一份 FDE 个人规划报告（Markdown 格式）。

报告结构：
1. 个人背景概述
2. 能力现状评估（三类能力分析）
3. 差距分析
4. 30/60/90 天学习路线建议
5. 求职准备建议
6. 总结与行动建议

个人画像：
${JSON.stringify(data.profile, null, 2)}

技能评分：
${skillText}

学习进度：${data.learningProgress.done}/${data.learningProgress.total}
周报数量：${data.weeklyCount}
求职准备：${data.jobPrepProgress.done}/${data.jobPrepProgress.total}`;
}
