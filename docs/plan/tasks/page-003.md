id: page-003
scope: fde-planner
status: pending
depends-on: [infra-002]

objective: |
  实现 /job-prep 页面：展示简历/作品集/面试/薪资四类 checklist，支持勾选完成、手动增删项、显示完成率。

context:
  - docs/planner/README.md
  - docs/planner/pages.md

path:
  - fde-planner/src/app/job-prep/page.tsx
  - fde-planner/src/app/api/job-prep/route.ts
  - fde-planner/src/components/JobChecklist.tsx

verification:
  - /job-prep 页面可访问
  - 默认 checklist 展示
  - 勾选更新 is_done
  - 添加/删除项正常
  - 完成率统计正确
  - tsc --noEmit 无错误
