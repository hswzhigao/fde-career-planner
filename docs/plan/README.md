# 交付计划

## 任务总览

| ID | 任务 | 依赖 | 说明 | 状态 |
|---|---|---|---|---|
| infra-001 | 项目初始化 + Prisma + MySQL | 无 | Next.js 骨架、Tailwind、Prisma、MySQL 连接 | done |
| infra-002 | 数据模型 + Seed | infra-001 | schema.prisma、迁移、默认 checklist + 学习骨架 | done |
| page-001 | 个人画像页面 + API | infra-002 | /profile 表单、保存、读取 | done |
| page-002 | 技能自评页面 + 雷达图 | infra-002 | /skills 评分、雷达图、历史 | done |
| ai-001 | AI 集成基础 | infra-002 | dim-agent-sdk + DeepSeek client | done |
| ai-002 | 差距分析 AI | ai-001, page-002 | /gap-analysis + /api/ai/analyze-gap | done |
| ai-003 | 学习计划 AI | ai-001, page-001 | /learning + /api/ai/generate-plan | done |
| ai-004 | 周报分析 AI | ai-001 | /weekly + /api/ai/review-weekly | done |
| page-003 | 求职准备清单 | infra-002 | /job-prep | done |
| page-004 | 总结导出 | 全部页面 | /export 文本 + Markdown | done |
| page-005 | 首页仪表盘 | 全部页面 | / 概览 | done |
| polish-001 | 整体优化 + README + .env 模板 | 全部 | 收尾 | done |
| stream-001 | AI 改为流式输出 | ai-001~004 | chatStream + SSE + useAIStream + AIStreamPanel | done |
| chat-001 | FDE 顾问多轮对话 | stream-001 | ChatSession/ChatMessage 表 + chatMultiTurn + /chat 页面 | done |
| auth-001a | Schema 更新 | infra-002 | 新增 User 模型 + 7 表加 userId + 外键 | pending |
| auth-001b | 数据库清空重建 | auth-001a | DROP + CREATE + prisma db push | pending |
| auth-001c | seed 改造 | auth-001b | 拆出 seedForUser(userId)，移除全局 seed | pending |
| auth-002a | 依赖安装 | 无 | bcryptjs + jsonwebtoken + types | pending |
| auth-002b | auth.ts 工具函数 | auth-002a, auth-001a | getSession/requireUser/requireAdmin + JWT | pending |
| auth-002c | middleware 路由守卫 | auth-002b | 公开/受保护/admin 路由分流 | pending |
| auth-003a | 注册 API + 逻辑 | auth-002b | POST /api/auth/register + 首个 admin | pending |
| auth-003b | 登录 API | auth-002b | POST /api/auth/login + JWT + cookie | pending |
| auth-003c | 登出 API | auth-002b | POST /api/auth/logout 清 cookie | pending |
| auth-003d | 注册页面 UI | auth-003a | /register 表单 + 校验 | pending |
| auth-003e | 登录页面 UI | auth-003b | /login 表单 + 跳转 | pending |
| auth-004a | profile API 改造 | auth-002b | /api/profile 按 userId 过滤 | pending |
| auth-004b | skills API 改造 | auth-002b | /api/skills 按 userId 过滤 | pending |
| auth-004c | learning API 改造 | auth-002b | /api/learning 按 userId 过滤 | pending |
| auth-004d | weekly API 改造 | auth-002b | /api/weekly 按 userId 过滤 | pending |
| auth-004e | job-prep API 改造 | auth-002b | /api/job-prep 按 userId 过滤 | pending |
| auth-004f | dashboard API 改造 | auth-002b | /api/dashboard 按 userId 过滤 | pending |
| auth-004g | AI API 改造（6 个） | auth-002b | /api/ai/* 按 userId 过滤 | pending |
| auth-004h | chat API 改造 | auth-002b | /api/chat 按 userId 过滤 | pending |
| auth-005a | 个人中心页面 | auth-004a | /account 头像+基本信息+阶段标签 | pending |
| auth-005b | 昵称修改 API + UI | auth-005a | PUT /api/account | pending |
| auth-005c | 修改密码 API + UI | auth-005a | PUT /api/account/password | pending |
| auth-005d | 删除账号 API + UI | auth-005a | DELETE /api/account + 确认弹窗 | pending |
| auth-006a | 统计 API | auth-004f | GET /api/admin/stats | pending |
| auth-006b | 用户列表 API | auth-002b | GET /api/admin/users 分页 | pending |
| auth-006c | 删除用户 API | auth-002b | DELETE /api/admin/users/[id] | pending |
| auth-006d | 管理后台页面 | auth-006a,b | /admin 统计 + 用户列表 | pending |
| auth-006e | 403 页面 | auth-002c | /forbidden 无权限页 | pending |
| ui-001a | Tailwind 配色更新 | 无 | warm 色系 + 中性色 + tailwind.config.ts | pending |
| ui-001b | Card 组件 | ui-001a | 统一卡片封装 | pending |
| ui-001c | Button 组件 | ui-001a | 主/次/危险/禁用 | pending |
| ui-001d | Badge 组件 | ui-001a | 阶段/状态徽章 | pending |
| ui-001e | EmptyState 组件 | ui-001a | 空状态 + 鼓励文案 | pending |
| ui-001f | ConfirmDialog 组件 | ui-001a | 二次确认弹窗 | pending |
| ui-002a | Sidebar 暖色化 + 用户区 | ui-001b | 暖色底 + 激活态 + 头像区 | pending |
| ui-002b | TopBar 组件 | ui-001b | 顶部栏标题 + 用户头像 | pending |
| ui-002c | UserMenu 组件 | ui-002b | 头像下拉菜单 | pending |
| ui-002d | layout.tsx 重构 | ui-002a,b,c | 整合 Sidebar + TopBar + UserMenu | pending |
| ui-003a | Dashboard 暖色化 | ui-002d | 卡片+鼓励文案+阶段徽章 | pending |
| ui-003b | ProfileForm 暖色化 | ui-002d | 表单+空状态 | pending |
| ui-003c | SkillAssessment 暖色化 | ui-002d | 评分+雷达图配色 | pending |
| ui-003d | GapAnalysisView 暖色化 | ui-002d | 卡片层级 | pending |
| ui-003e | LearningBoard 暖色化 | ui-002d | 进度条+任务勾选 | pending |
| ui-003f | WeeklyForm 暖色化 | ui-002d | 表单+周报卡 | pending |
| ui-003g | JobChecklist 暖色化 | ui-002d | 清单+完成徽章 | pending |
| ui-003h | ChatInterface 暖色化 | ui-002d | 对话气泡 | pending |
| ui-003i | ExportView 暖色化 | ui-002d | 导出卡片 | pending |
| ui-003j | AIStreamPanel 暖色化 | ui-002d | 流式输出容器 | pending |
| ui-004a | 登录/注册页暖色化 | ui-002d, auth-003d,e | 套新风格 | pending |
| ui-004b | 个人中心暖色化 | ui-002d, auth-005a | 套新风格 | pending |
| ui-004c | 管理后台暖色化 | ui-002d, auth-006d | 套新风格 | pending |

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
                          polish-001 ─────┤
                          stream-001 ─► chat-001 ──┘

── auth 线 ──────────────────────────────────────────────
auth-001a ─► auth-001b ─► auth-001c
auth-002a ─► auth-002b ─► auth-002c
                ├─► auth-003a ─► auth-003d
                ├─► auth-003b ─► auth-003e
                ├─► auth-003c
                ├─► auth-004a~h（并行）
                │        └─► auth-005a ─► auth-005b/c/d
                │        └─► auth-006a/b/c ─► auth-006d
                └─► auth-006e

── ui 线 ────────────────────────────────────────────────
ui-001a ─► ui-001b~f（并行）
ui-001b ─► ui-002a ─► ui-002d ─► ui-003a~j（并行）
                            └─► ui-004a/b/c
```

## 执行模式

单工作目录，无 worktree。任务串行执行，每个任务 verify 通过后合并到 main 再开下一个。

## 验证标准

每个任务必须：

1. TypeScript 类型检查通过
2. 相关页面可访问
3. 相关 API 返回正确
4. 与设计文档一致
