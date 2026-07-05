id: page-001
scope: fde-planner
status: pending
depends-on: [infra-002]

objective: |
  实现 /profile 页面：表单填写个人画像，保存到 profiles 表，读取已有数据回填。包含 AI 一键生成画像总结按钮（按钮先占位，实际调用在 ai-001 后接入）。

context:
  - docs/planner/README.md
  - docs/planner/pages.md
  - docs/planner/data-model.md

path:
  - fde-planner/src/app/profile/page.tsx
  - fde-planner/src/app/api/profile/route.ts
  - fde-planner/src/components/ProfileForm.tsx

verification:
  - /profile 页面可访问
  - 表单可填写并保存
  - 刷新后数据回填
  - API GET/PUT 正常
  - tsc --noEmit 无错误
