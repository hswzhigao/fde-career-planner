id: infra-001
scope: fde-planner
status: pending
depends-on: []

objective: |
  初始化 Next.js 14 项目，配置 TypeScript、TailwindCSS、Prisma、MySQL 连接、shadcn/ui，确保 `pnpm dev` 能启动空页面。

context:
  - docs/INDEX.md
  - docs/planner/README.md

path:
  - fde-planner/package.json
  - fde-planner/tsconfig.json
  - fde-planner/next.config.mjs
  - fde-planner/tailwind.config.ts
  - fde-planner/postcss.config.mjs
  - fde-planner/.env.local
  - fde-planner/.env.example
  - fde-planner/.gitignore
  - fde-planner/src/app/layout.tsx
  - fde-planner/src/app/page.tsx
  - fde-planner/src/app/globals.css
  - fde-planner/src/lib/db.ts
  - fde-planner/prisma/schema.prisma

verification:
  - pnpm install 成功
  - pnpm dev 启动后 http://localhost:3000 返回页面
  - Prisma 能连接本地 MySQL（npx prisma db push 不报错）
  - tsc --noEmit 无类型错误
