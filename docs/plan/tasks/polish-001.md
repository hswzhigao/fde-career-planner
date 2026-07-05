id: polish-001
scope: fde-planner
status: pending
depends-on: [page-004, page-005]

objective: |
  整体优化：统一导航布局、响应式适配、空状态/加载/错误状态完善、README、.env.example、启动说明。

context:
  - docs/INDEX.md
  - docs/planner/README.md

path:
  - fde-planner/src/app/layout.tsx
  - fde-planner/src/components/Sidebar.tsx
  - fde-planner/README.md
  - fde-planner/.env.example

verification:
  - 所有页面导航一致
  - 移动端可用
  - README 包含启动步骤
  - .env.example 包含所有环境变量
  - tsc --noEmit 无错误
