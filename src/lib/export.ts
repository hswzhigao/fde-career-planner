import { SKILLS, SKILL_CATEGORIES, SKILLS_BY_CATEGORY, type SkillCategory } from "./constants/skills";

export function buildExportText(data: {
  profile: Record<string, unknown> | null;
  scores: Record<string, number>;
  learningProgress: { total: number; done: number };
  weeklyCount: number;
  jobPrepProgress: { total: number; done: number };
}): string {
  const { profile, scores, learningProgress, weeklyCount, jobPrepProgress } = data;
  const lines: string[] = [];

  lines.push("=== FDE 个人规划摘要 ===\n");

  if (profile) {
    lines.push("【我的当前背景】");
    lines.push(`岗位：${profile.current_role || "未填写"}`);
    lines.push(`年限：${profile.years_of_experience || 0} 年`);
    lines.push(`技术栈：${profile.tech_stack || "未填写"}`);
    lines.push(`项目经历：${profile.project_experience || "未填写"}`);
    const tags: string[] = [];
    if (profile.has_customer_communication) tags.push("客户沟通");
    if (profile.has_tob_delivery) tags.push("ToB交付");
    if (profile.has_ai_experience) tags.push("AI经验");
    if (profile.can_travel) tags.push("可出差");
    lines.push(`经验标签：${tags.join(", ") || "无"}`);
    lines.push("");
    lines.push("【我的 FDE 目标】");
    lines.push(`目标岗位：${profile.target_role_type || "未填写"}`);
    lines.push(`目标薪资：${profile.target_salary || "未填写"}`);
    lines.push(`偏好行业：${profile.preferred_industries || "未填写"}`);
    lines.push(`每周学习时间：${profile.weekly_study_hours || 0} 小时`);
    lines.push("");
  }

  lines.push("【当前评分】");
  const cats: SkillCategory[] = ["delivery", "ai_engineering", "business"];
  for (const cat of cats) {
    const skills = SKILLS_BY_CATEGORY(cat);
    const filled = skills.filter((s) => (scores[s.key] ?? 0) > 0);
    const total = filled.reduce((sum, s) => sum + (scores[s.key] ?? 0), 0);
    const avg = filled.length > 0 ? (total / filled.length).toFixed(1) : "0";
    lines.push(`${SKILL_CATEGORIES[cat].label}：${avg}/5`);
  }
  lines.push("");

  lines.push("【主要短板】");
  const allSkills = SKILLS.map((s) => ({ ...s, score: scores[s.key] ?? 0 }))
    .filter((s) => s.score > 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);
  if (allSkills.length === 0) {
    lines.push("尚未评分");
  } else {
    allSkills.forEach((s, i) => lines.push(`${i + 1}. ${s.label}：${s.score}/5`));
  }
  lines.push("");

  lines.push("【学习进度】");
  lines.push(`完成 ${learningProgress.done}/${learningProgress.total} 个任务`);
  lines.push(`周报记录：${weeklyCount} 篇`);
  lines.push(`求职准备：${jobPrepProgress.done}/${jobPrepProgress.total} 项`);
  lines.push("");

  lines.push("【接下来需要】");
  lines.push("1. 补齐主要短板");
  lines.push("2. 完成 30/60/90 天学习计划");
  lines.push("3. 做好作品集和面试准备");
  lines.push("4. 持续每周追踪进展");

  return lines.join("\n");
}

export function buildMarkdown(data: Parameters<typeof buildExportText>[0]): string {
  const text = buildExportText(data);
  return `# FDE 个人规划摘要\n\n生成时间：${new Date().toLocaleString("zh-CN")}\n\n${text}`;
}
