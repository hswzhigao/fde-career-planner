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

- 多用户系统，邮箱密码注册登录，按 `userId` 隔离数据
- 数据存本地 MySQL，不做云端同步
- AI 能力通过 `@archships/dim-agent-sdk` + DeepSeek 提供
- 不替代通用项目管理工具，只聚焦 FDE 转型场景
- 认证方案：bcrypt 哈希 + JWT httpOnly cookie，第一个注册用户为 admin

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
┌────────────────────────────────────────────────────────────┐
│                    Next.js App Router                       │
│                                                             │
│  (public)              (protected, 需登录)                  │
│  /login  /register     /  /profile  /skills  /gap-analysis  │
│                        /learning /weekly /job-prep          │
│                        /chat /export /account               │
│                        /admin/* (仅 admin)                  │
│         │                                                │
│         ▼                                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  middleware.ts  — 校验 JWT cookie，未登录跳 /login    │  │
│  └──────────────────────────────────────────────────────┘  │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes  (全部从 JWT 解析 userId，按 userId 查询) │  │
│  │  /api/auth/*  /api/profile  /api/skills ...           │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │  src/lib/auth.ts  — JWT 签发/校验 + session 辅助      │  │
│  │  src/lib/db.ts    — Prisma (新增 User 模型)           │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## AI 模式

工作台支持两种 AI 交互模式：

| 模式 | 场景 | 实现 |
|---|---|---|
| 一次性流式 | 画像总结、差距分析、学习计划、周报分析、规划报告 | `chatStream()` + SSE |
| 多轮对话 | FDE 顾问自由问答、追问 | `chatMultiTurn()` + SSE + 会话持久化 |

两种模式都通过 SSE (Server-Sent Events) 实时流式输出，用户可以看到 AI 逐字生成内容。

## 核心概念

| 概念 | 定义 |
|---|---|
| Profile | 用户当前背景、经验、目标、约束 |
| Skill Assessment | 三类能力（客户交付 / AI 工程 / 业务理解）的自评分数 |
| Gap Analysis | 基于评分与目标的差距分析 |
| Learning Task | 30/60/90 天学习计划中的具体任务 |
| Weekly Log | 每周学习与项目进展记录 |
| Job Checklist Item | 求职准备清单项 |
| AI Summary | AI 生成的画像总结、计划、分析等（一次性流式） |
| Chat Session | FDE 顾问多轮对话会话，持久化到数据库 |
| Chat Message | 对话中的单条消息（user/assistant），支持上下文记忆 |

## 状态所有权

| 数据 | 创建者 | 更新者 | 存储 |
|---|---|---|---|
| Profile | 用户填写 | 用户更新 | profiles 表 |
| Skill Assessment | 用户自评 | 用户重评 | skill_assessments 表 |
| Learning Task | AI 生成 / 用户调整 | 用户更新状态 | learning_tasks 表 |
| Weekly Log | 用户填写 | 用户更新 | weekly_logs 表 |
| Job Checklist | 默认模板 + 用户增删 | 用户勾选 | job_checklist_items 表 |
| AI Summary | AI 接口生成 | 每次生成新记录 | ai_summaries 表 |
| Chat Session | 用户发起新对话 | AI 回复时更新 title | chat_sessions 表 |
| Chat Message | 用户发送 + AI 回复 | 不可变 | chat_messages 表 |

## 子文档

- [数据模型](data-model.md)
- [AI 集成](ai-integration.md)
- [页面与交互](pages.md)
- [认证系统](auth.md)
- [UI 设计系统](ui-design-system.md)
