# FDE Personal Planner — 设计总览

## 目标

为程序员提供一个本地运行的个人规划工作台，支撑从"普通开发"向 Forward Deployed Engineer（FDE / 前线部署工程师）转型的全过程：

1. 诊断当前背景与目标
2. 评估三类能力差距（客户交付 / AI 工程 / 业务理解）
3. 生成 30/60/90 天学习路线
4. 每周追踪学习与项目进展
5. 管理求职准备清单
6. 导出可复用的个人规划摘要

## 边界

- 单用户、本地使用，不做账号系统
- 数据存本地 MySQL，不做云端同步
- AI 能力通过 `@archships/dim-agent-sdk` + DeepSeek 提供
- 不替代通用项目管理工具，只聚焦 FDE 转型场景

## 技术栈

| 层 | 选型 | 理由 |
|---|---|---|
| 框架 | Next.js 14 (App Router) | 前后端一体，单进程 |
| 语言 | TypeScript | 类型安全 |
| 数据库 | MySQL 127.0.0.1:3306 | 已有本地环境 |
| ORM | Prisma | TS 友好、迁移方便 |
| AI | `@archships/dim-agent-sdk` + DeepSeek | 国内稳定、中文好、成本低 |
| UI | TailwindCSS + shadcn/ui | 快速搭建 |
| 图表 | Recharts | 技能雷达图 |

## 模块关系

```text
┌──────────────────────────────────────────────────────┐
│                   Next.js App Router                  │
│                                                       │
│  profile  skills  gap  learning  weekly  job  export │
│     │       │     │      │        │      │      │    │
│     ▼       ▼     ▼      ▼        ▼      ▼      ▼    │
│  ┌─────────────────────────────────────────────────┐ │
│  │              API Routes /api/ai/*               │ │
│  │   summarize  plan  gap  weekly  report          │ │
│  └───────────────────────┬─────────────────────────┘ │
│                          │                            │
│  ┌───────────────────────▼─────────────────────────┐ │
│  │           src/lib/ai/  (dim-agent-sdk)          │ │
│  │   client.ts  summarize  plan  gap  weekly       │ │
│  └───────────────────────┬─────────────────────────┘ │
│                          │                            │
│  ┌───────────────────────▼─────────────────────────┐ │
│  │              Prisma → MySQL (local)              │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

## 核心概念

| 概念 | 定义 |
|---|---|
| Profile | 用户当前背景、经验、目标、约束 |
| Skill Assessment | 三类能力（客户交付 / AI 工程 / 业务理解）的自评分数 |
| Gap Analysis | 基于评分与目标的差距分析 |
| Learning Task | 30/60/90 天学习计划中的具体任务 |
| Weekly Log | 每周学习与项目进展记录 |
| Job Checklist Item | 求职准备清单项 |
| AI Summary | AI 生成的画像总结、计划、分析等 |

## 状态所有权

| 数据 | 创建者 | 更新者 | 存储 |
|---|---|---|---|
| Profile | 用户填写 | 用户更新 | profiles 表 |
| Skill Assessment | 用户自评 | 用户重评 | skill_assessments 表 |
| Learning Task | AI 生成 / 用户调整 | 用户更新状态 | learning_tasks 表 |
| Weekly Log | 用户填写 | 用户更新 | weekly_logs 表 |
| Job Checklist | 默认模板 + 用户增删 | 用户勾选 | job_checklist_items 表 |
| AI Summary | AI 接口生成 | 每次生成新记录 | ai_summaries 表 |

## 子文档

- [数据模型](data-model.md)
- [AI 集成](ai-integration.md)
- [页面与交互](pages.md)
