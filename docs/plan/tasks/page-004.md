id: page-004
scope: fde-planner
status: pending
depends-on: [page-001, page-002, ai-001]

objective: |
  实现 /export 页面：聚合 profile + skills + learning + weekly + job-prep 生成可复制文本摘要，支持下载 Markdown，AI 按钮生成完整规划报告。

context:
  - docs/planner/README.md
  - docs/planner/pages.md
  - docs/planner/ai-integration.md

path:
  - fde-planner/src/app/export/page.tsx
  - fde-planner/src/app/api/ai/generate-report/route.ts
  - fde-planner/src/lib/ai/report.ts
  - fde-planner/src/lib/export.ts
  - fde-planner/src/components/ExportView.tsx

verification:
  - /export 页面可访问
  - 文本摘要包含画像+评分+进度
  - 下载 Markdown 文件正确
  - AI 报告生成成功
  - tsc --noEmit 无错误
