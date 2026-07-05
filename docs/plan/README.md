# 交付计划

## 任务总览

| ID | 任务 | 依赖 | 说明 |
|---|---|---|---|
| infra-001 | 项目初始化 + Prisma + MySQL | 无 | Next.js 骨架、Tailwind、Prisma、MySQL 连接 |
| infra-002 | 数据模型 + Seed | infra-001 | schema.prisma、迁移、默认 checklist + 学习骨架 |
| page-001 | 个人画像页面 + API | infra-002 | /profile 表单、保存、读取 |
| page-002 | 技能自评页面 + 雷达图 | infra-002 | /skills 评分、雷达图、历史 |
| ai-001 | AI 集成基础 | infra-002 | dim-agent-sdk + DeepSeek client |
| ai-002 | 差距分析 AI | ai-001, page-002 | /gap-analysis + /api/ai/analyze-gap |
| ai-003 | 学习计划 AI | ai-001, page-001 | /learning + /api/ai/generate-plan |
| ai-004 | 周报分析 AI | ai-001 | /weekly + /api/ai/review-weekly |
| page-003 | 求职准备清单 | infra-002 | /job-prep |
| page-004 | 总结导出 | 全部页面 | /export 文本 + Markdown |
| page-005 | 首页仪表盘 | 全部页面 | / 概览 |
| polish-001 | 整体优化 + README + .env 模板 | 全部 | 收尾 |

## 依赖关系

```text
infra-001 ──► infra-002 ──┬─► page-001 ──┐
                          ├─► page-002 ──┤
                          └─► ai-001 ─────┤
                                          │
              ai-001 ─► ai-002 ───────────┤
              ai-001 ─► ai-003 ───────────┤
              ai-001 ─► ai-004 ───────────┤
                                          │
              infra-002 ─► page-003 ──────┤
                          page-004 ───────┤
                          page-005 ───────┤
                          polish-001 ─────┘
```

## 执行模式

单工作目录，无 worktree。任务串行执行，每个任务 verify 通过后合并到 main 再开下一个。

## 验证标准

每个任务必须：

1. TypeScript 类型检查通过
2. 相关页面可访问
3. 相关 API 返回正确
4. 与设计文档一致
