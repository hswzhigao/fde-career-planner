# FDE Career Planner

程序员转型 Forward Deployed Engineer（FDE / 前线部署工程师）的个人规划工作台。

本地运行，支持：
- 个人画像诊断
- 三类能力自评（客户交付 / AI 工程 / 业务理解）
- AI 生成差距分析与学习路线
- 每周进展追踪
- 求职准备清单
- 总结导出

## 技术栈

- Next.js 14 + TypeScript
- Prisma + MySQL
- @archships/dim-agent-sdk + DeepSeek
- TailwindCSS + shadcn/ui + Recharts

## 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入 DEEPSEEK_API_KEY 和 DATABASE_URL

# 3. 初始化数据库
npx prisma db push
npx prisma db seed

# 4. 启动
pnpm dev
```

打开 http://localhost:3000

## 文档

设计文档位于 `docs/` 目录，遵循 docs-sprint 规范。

## License

MIT
