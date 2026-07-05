import { SKILLS, SKILLS_BY_CATEGORY, type SkillCategory } from "@/lib/constants/skills";

export function getLatestScores(scores: Record<string, number>) {
  return SKILLS.map((s) => ({ ...s, score: scores[s.key] ?? 0 }));
}

export function getCategoryAverages(scores: Record<string, number>) {
  const cats: SkillCategory[] = ["delivery", "ai_engineering", "business"];
  return cats.map((cat) => {
    const skills = SKILLS_BY_CATEGORY(cat);
    const filled = skills.filter((s) => (scores[s.key] ?? 0) > 0);
    const total = filled.reduce((sum, s) => sum + (scores[s.key] ?? 0), 0);
    const avg = filled.length > 0 ? total / filled.length : 0;
    return { category: cat, avg: Number(avg.toFixed(1)) };
  });
}

export function getStrengthsAndWeaknesses(scores: Record<string, number>) {
  const items = SKILLS.map((s) => ({ ...s, score: scores[s.key] ?? 0 }))
    .filter((s) => s.score > 0);

  const strengths = [...items].sort((a, b) => b.score - a.score).slice(0, 5);
  const weaknesses = [...items].sort((a, b) => a.score - b.score).slice(0, 5);

  return { strengths, weaknesses };
}

export function recommendPath(scores: Record<string, number>): string {
  const avgs = getCategoryAverages(scores);
  const delivery = avgs.find((a) => a.category === "delivery")?.avg ?? 0;
  const ai = avgs.find((a) => a.category === "ai_engineering")?.avg ?? 0;
  const business = avgs.find((a) => a.category === "business")?.avg ?? 0;

  if (ai >= delivery && ai >= business) {
    return "AI 工程 / 大模型应用方向 FDE — 你的 AI 技术能力突出，适合从 AI 应用工程切入";
  }
  if (delivery >= business) {
    return "企业交付 / 解决方案方向 FDE — 你的客户交付能力较强，适合从解决方案工程切入";
  }
  return "行业 AI 方案方向 FDE — 你的业务理解能力突出，适合从行业切入做垂直 AI 方案";
}
