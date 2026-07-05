# FDE Career Planner 🎯

> 程序员转型 **Forward Deployed Engineer（FDE / 前线部署工程师）** 的个人规划工作台。
>
> 诊断能力差距 → AI 生成学习路线 → 每周追踪进展 → 求职准备清单 → AI 顾问随时问答

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)](https://www.mysql.com/)
[![DeepSeek](https://img.shields.io/badge/AI-DeepSeek-00D4AA?logo=deepseek)](https://www.deepseek.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📖 这是什么

FDE Career Planner 是一个本地运行的 Web 应用，帮助程序员系统化地规划从普通开发岗位向 FDE（Forward Deployed Engineer）转型的全过程。

FDE 是 Palantir 首创、被 OpenAI / Anthropic / Google 等公司在 AI 时代重新激活的岗位——**驻扎在客户现场，用工程能力把 AI 模型真正落地到业务流程中**。

本工作台覆盖 FDE 转型的完整闭环：

```
诊断现状 → 评估能力差距 → AI 生成学习路线 → 每周追踪进展 → 求职准备 → AI 顾问问答
```

---

## ✨ 核心功能

### 📊 能力诊断

- **个人画像**：记录当前岗位、技术栈、项目经验、目标方向
- **技能自评**：3 大类 21 项能力 1-5 分评分，雷达图可视化
  - 客户交付（7 项）：需求访谈、方案表达、PoC 设计…
  - AI 工程（8 项）：LLM API、RAG、Agent、Evals、可观测性…
  - 业务理解（6 项）：流程建模、ROI 指标、行业知识…
- **差距分析**：基于评分自动生成优势/短板/优先补齐清单

### 🤖 AI 驱动（DeepSeek + dim-agent-sdk）

所有 AI 功能均支持 **流式逐字输出**，实时看到生成过程：

| 功能 | 说明 |
|---|---|
| AI 画像总结 | 基于个人画像数据生成结构化转型诊断 |
| AI 差距分析 | 深度分析能力差距，给出优先补齐建议 |
| AI 学习计划 | 基于画像+评分生成 30/60/90 天学习计划 |
| AI 周报分析 | 分析每周进展，给出下周建议 |
| AI 规划报告 | 聚合全量数据生成完整转型规划报告 |
| **追问** | 每个 AI 结果生成后可继续追问，带上下文记忆 |

### 💬 FDE 顾问对话

- 多轮对话，支持上下文记忆
- 对话历史持久化到 MySQL，刷新不丢
- 左侧会话列表，可新建/切换/删除
- 流式逐字回复
- 推荐问题快捷入口

### 📈 进展追踪

- **学习路线**：30/60/90 天三阶段任务管理，支持勾选完成、手动添加
- **每周追踪**：周报记录 + 三类能力训练自评 + 连续学习周数
- **求职准备**：简历/作品集/面试/薪资 4 类 17 项清单

### 📤 总结导出

- 一键生成可复制的文本摘要
- 下载 Markdown 文件
- AI 生成完整规划报告

---

## 🛠 技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| 框架 | Next.js 14 (App Router) | 前后端一体，单进程 |
| 语言 | TypeScript | 全量类型安全 |
| 数据库 | MySQL + Prisma ORM | 8 张表，本地运行 |
| AI | @archships/dim-agent-sdk + DeepSeek | 流式 SSE 输出 |
| UI | TailwindCSS | 简洁响应式 |
| 图表 | Recharts | 技能雷达图 |

---

## 🚀 快速开始

### 前置要求

- Node.js 18+
- MySQL 8.0+
- DeepSeek API Key（[获取地址](https://platform.deepseek.com/)）

### 安装

```bash
git clone https://github.com/hswzhigao/fde-career-planner.git
cd fde-career-planner

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入：
#   DATABASE_URL=mysql://root:123456@127.0.0.1:3306/fde_planner
#   DEEPSEEK_API_KEY=sk-your-key-here

# 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS fde_planner CHARACTER SET utf8mb4;"

# 初始化表结构 + 种子数据
npx prisma db push
npx prisma db seed

# 启动
pnpm dev
```

打开 http://localhost:3000 即可使用。

### 环境变量

| 变量 | 说明 | 示例 |
|---|---|---|
| `DATABASE_URL` | MySQL 连接串 | `mysql://root:123456@127.0.0.1:3306/fde_planner` |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | `sk-xxx` |
| `DEEPSEEK_BASE_URL` | API 地址（可选） | `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | 模型名（可选） | `deepseek-chat` |

---

## 📸 功能预览

### 仪表盘

全貌一览：画像概览 + 三类能力分 + 学习进度 + 周报 + 求职完成率

### 技能自评 + 雷达图

21 项能力可视化评分，短板一目了然

### AI 流式输出

所有 AI 功能实时逐字生成，带光标动画和加载指示

### FDE 顾问对话

多轮对话，随时追问转型问题

---

## 📁 项目结构

```
fde-career-planner/
├── prisma/
│   ├── schema.prisma          # 数据模型（8 张表）
│   └── seed.ts                # 种子数据
├── src/
│   ├── app/
│   │   ├── page.tsx           # 仪表盘
│   │   ├── profile/           # 个人画像
│   │   ├── skills/            # 技能自评
│   │   ├── gap-analysis/      # 差距分析
│   │   ├── learning/          # 学习路线
│   │   ├── weekly/            # 每周追踪
│   │   ├── job-prep/          # 求职准备
│   │   ├── chat/              # FDE 顾问对话
│   │   ├── export/            # 总结导出
│   │   └── api/
│   │       ├── ai/            # 6 个 AI API（SSE 流式）
│   │       ├── chat/          # 对话 API
│   │       ├── profile/       # CRUD API
│   │       ├── skills/
│   │       ├── learning/
│   │       ├── weekly/
│   │       ├── job-prep/
│   │       └── dashboard/
│   ├── components/            # UI 组件
│   ├── lib/
│   │   ├── ai/                # AI 集成（dim-agent-sdk）
│   │   ├── constants/         # 技能模型、清单模板
│   │   ├── hooks/             # useAIStream hook
│   │   └── db.ts              # Prisma client
│   └── ...
├── docs/                      # 设计文档（docs-sprint 规范）
└── .env.example
```

---

## 🗄 数据模型

| 表 | 说明 |
|---|---|
| `profiles` | 个人画像（单条） |
| `skill_assessments` | 技能评分（历史记录） |
| `learning_tasks` | 学习任务（30/60/90 天） |
| `weekly_logs` | 每周追踪记录 |
| `job_checklist_items` | 求职准备清单 |
| `ai_summaries` | AI 生成的总结和分析 |
| `chat_sessions` | 对话会话 |
| `chat_messages` | 对话消息 |

---

## 📚 设计文档

项目使用 [docs-sprint](https://www.npmjs.com/package/docs-sprint) 规范管理设计文档：

- [文档索引](docs/INDEX.md)
- [设计总览](docs/planner/README.md)
- [数据模型](docs/planner/data-model.md)
- [AI 集成](docs/planner/ai-integration.md)
- [页面设计](docs/planner/pages.md)
- [交付计划](docs/plan/README.md)

---

## 🔍 FDE 是什么

**FDE（Forward Deployed Engineer，前线部署工程师）** 是 Palantir 在 2010 年左右首创的岗位，2025-2026 年因 AI 落地难问题在硅谷重新爆火。

核心定义：

> 嵌入客户现场或客户业务场景、用工程能力直接把产品/平台/AI 能力落地到真实业务流程中的工程师角色。

不是前端工程师，不是传统售前，不是外包实施。它是：

```
能写生产代码的客户现场问题 owner + 端到端交付工程师 + 业务/产品翻译器
```

AI 时代的 FDE 进一步演化为：

```
全栈/后端工程能力 + LLM/RAG/Agent/evals 实战 + 企业系统集成 + 客户现场交付 + 业务结果负责
```

相关阅读：
- [Palantir FDSE 招聘](https://jobs.lever.co/palantir/5168e8fd-fec1-4fea-b7a1-81bdaea65850)
- [OpenAI FDE 招聘](https://jobs.ashbyhq.com/openai/305a4b22-7ff9-4fa5-9229-c6a22c9aa64f)
- [The New Stack: Why the forward-deployed engineer is tech's hottest job](https://thenewstack.io/why-the-forward-deployed-engineer-is-techs-hottest-job/)

---

## 🎯 适合谁用

- 后端/前端/全栈程序员，想转向 FDE / AI 解决方案 / 大模型应用岗位
- 有一定技术基础，想靠近客户和业务
- 需要系统化规划转型路径，而不是零散学习
- 想用 AI 辅助诊断能力差距和生成学习计划

---

## 📝 License

MIT
