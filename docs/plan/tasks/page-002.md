id: page-002
scope: fde-planner
status: pending
depends-on: [infra-002]

objective: |
  实现 /skills 页面：三类能力（客户交付 7 项 / AI 工程 8 项 / 业务理解 6 项）的 1-5 分自评，Recharts 雷达图展示，保存评分到 skill_assessments，支持历史对比。

context:
  - docs/planner/README.md
  - docs/planner/pages.md
  - docs/planner/data-model.md
  - fde-planner/src/lib/constants/skills.ts

path:
  - fde-planner/src/app/skills/page.tsx
  - fde-planner/src/app/api/skills/route.ts
  - fde-planner/src/components/SkillAssessment.tsx
  - fde-planner/src/components/SkillRadarChart.tsx

verification:
  - /skills 页面可访问
  - 21 项技能可评分
  - 雷达图正确显示三大类均分
  - 保存后刷新数据不丢
  - 历史评分可查看
  - tsc --noEmit 无错误
