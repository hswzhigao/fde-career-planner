id: infra-002
scope: fde-planner
status: pending
depends-on: [infra-001]

objective: |
  定义完整 Prisma schema（profiles / skill_assessments / learning_tasks / weekly_logs / job_checklist_items / ai_summaries），执行迁移，编写 seed 脚本初始化默认 job checklist 和学习任务骨架。

context:
  - docs/planner/README.md
  - docs/planner/data-model.md

path:
  - fde-planner/prisma/schema.prisma
  - fde-planner/prisma/seed.ts
  - fde-planner/src/lib/constants/skills.ts
  - fde-planner/src/lib/constants/job-checklist.ts

verification:
  - npx prisma db push 成功
  - npx prisma db seed 成功
  - 数据库 6 张表存在
  - job_checklist_items 有默认数据
  - learning_tasks 有默认骨架数据
  - tsc --noEmit 无错误
