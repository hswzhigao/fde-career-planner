id: page-005
scope: fde-planner
status: pending
depends-on: [page-001, page-002, ai-003, ai-004, page-003]

objective: |
  实现首页仪表盘 /：展示当前画像概览、三类能力总分、学习进度、最近周报、求职准备完成率，提供各模块入口。

context:
  - docs/planner/README.md
  - docs/planner/pages.md

path:
  - fde-planner/src/app/page.tsx
  - fde-planner/src/components/Dashboard.tsx
  - fde-planner/src/app/api/dashboard/route.ts

verification:
  - / 页面可访问
  - 画像概览正确显示
  - 三类能力分数正确
  - 学习进度正确
  - 最近周报展示
  - 求职准备完成率正确
  - tsc --noEmit 无错误
