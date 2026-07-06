# 认证系统设计

## 目标

将原"单用户、本地使用"工作台升级为多用户系统：邮箱密码注册登录、JWT 会话、按用户隔离数据、超级管理员后台。

## 边界变更

原设计（`docs/planner/README.md` 边界章节）明确"单用户、本地使用，不做账号系统"。本次变更为：

- 多用户系统，每个用户拥有独立的一套规划数据
- 数据按 `userId` 隔离
- 第一个注册用户自动成为 `admin`（超级管理员），之后为 `user`
- 清空现有数据库重建，不做数据迁移

## User 模型

| 字段 | 类型 | 说明 |
|---|---|---|
| id | Int PK | 主键 |
| email | String @unique | 邮箱 |
| passwordHash | String | bcrypt 哈希（cost 10） |
| nickname | String @default("") | 昵称，空则取邮箱 @ 前部分 |
| avatarSeed | String @default("") | DiceBear 头像种子，注册时取邮箱 hash |
| role | String @default("user") | "user" \| "admin" |
| createdAt | DateTime @default(now()) | 注册时间 |
| updatedAt | DateTime @updatedAt | 更新时间 |

## 现有表加 userId

| 表 | 关系 |
|---|---|
| Profile | User 1 → N Profile（按 userId 取，不再"取第一条"） |
| SkillAssessment | User 1 → N |
| LearningTask | User 1 → N |
| WeeklyLog | User 1 → N |
| JobChecklistItem | User 1 → N |
| AiSummary | User 1 → N |
| ChatSession | User 1 → N |
| ChatMessage | 通过 ChatSession 间接归属用户（已有 session_id 外键，不加 userId） |

所有外键 `onDelete: Cascade`，删用户连带删其规划数据。

## 注册 `/register`

### 校验规则

- 邮箱格式 + 唯一性检查（已存在返回 409）
- 密码 ≥ 8 位，前端 + 后端校验
- 两次密码一致
- 昵称可空，空则取邮箱 `@` 前部分

### 注册成功后

1. bcrypt 哈希密码（cost 10）
2. 第一个注册的用户 → `role = admin`，之后 → `role = user`
3. 为新用户自动 seed：1 条空 Profile + 17 项默认 checklist + 15 条学习骨架（复用 seed 逻辑，加 userId）
4. 签发 JWT，写 httpOnly cookie
5. 跳转 `/`（仪表盘）

## 登录 `/login`

### 流程

1. 按邮箱查 User
2. 不存在 / 密码错 → 统一返回"邮箱或密码错误"（不暴露用户是否存在）
3. bcrypt.compare 校验
4. 签发 JWT，httpOnly cookie，跳转 `/`

## JWT 设计

| 项 | 值 |
|---|---|
| Payload | `{ sub: userId, role, iat, exp }` |
| 算法 | HS256 |
| 密钥 | `.env` 的 `JWT_SECRET` |
| 有效期 | 7 天 |
| 存储 | `httpOnly` + `secure`（生产）+ `sameSite: lax` 的 cookie，名为 `fde_session` |
| Refresh | 不做，过期重登 |

## 登出 `/logout`（API）

清掉 `fde_session` cookie，跳转 `/login`。

## 中间件路由守卫 `middleware.ts`

### 公开路由（不需登录）

- `/login`
- `/register`
- `/api/auth/*`

### 受保护路由（需登录）

- 其余所有页面和 API

### admin 专属路由

- `/admin/*`
- `/api/admin/*`

### 逻辑

1. 读 `fde_session` cookie
2. 无 cookie 或 JWT 校验失败 → 页面跳 `/login`，API 返 401
3. 校验通过 → `next()`
4. `/admin/*` 额外校验 `role === admin`，否则跳 `/forbidden`

## Session 辅助 `src/lib/auth.ts`

```typescript
getSession(req): { userId: number, role: string } | null
requireUser(req): { userId, role }  // 失败抛 401
requireAdmin(req): { userId, role } // 失败抛 403
```

所有现有 API route 的入口从 `findFirst()` 改为 `requireUser(req)` 拿到 userId 后按 userId 过滤。

## 环境变量新增

```env
JWT_SECRET="你的随机密钥"
```

## 个人中心 `/account`

### 页面内容

- 头像（DiceBear `shapes` 风格，URL `https://api.dicebear.com/7.x/shapes/svg?seed={avatarSeed}`）
- 昵称、邮箱、注册时间
- 转型阶段标签（自动计算）

### 转型阶段判定

| 阶段 | 判定条件 |
|---|---|
| 探索期 | Profile 未填或刚注册 |
| 诊断期 | Profile 已填，但无技能评分 |
| 规划期 | 有技能评分，但无学习任务 |
| 执行期 | 有学习任务且至少 1 项 done |
| 求职期 | 学习任务完成率 ≥ 50% |

### 昵称编辑

- `PUT /api/account` 接受 `{ nickname }`
- 不允许纯空白，可清空（清空则回退显示邮箱 `@` 前部分）

### 修改密码

- `PUT /api/account/password` 接受 `{ currentPassword, newPassword }`
- 先 bcrypt.compare 当前密码，不对返回 400
- 新密码 ≥ 8 位
- 修改后不强制重登

### 删除账号

- `DELETE /api/account` 校验 `targetId === selfId`
- 需要输入"删除账号"文字二次确认
- Cascade 删除所有规划数据
- 删除自己 → 清 cookie，跳 `/login`
- admin 删除自己 → 拒绝（防止没有管理员）

## 管理员后台 `/admin`

### 权限

- 仅 `role === "admin"` 可见可访问
- 普通用户访问 `/admin/*` → 403 页面
- 侧边栏底部：admin 用户多显示"管理后台"入口

### 全站统计指标

| 指标 | 计算方式 |
|---|---|
| 总用户数 | `User.count()` |
| 活跃用户 | 近 7 天有 `updatedAt` 变动的用户数 |
| 学习任务 | 全站 `LearningTask.count()` |
| AI 调用 | 全站 `AiSummary.count()` |

### 用户列表

- 表格：头像、邮箱、昵称、角色、注册时间、操作
- admin 自己那行操作为"—"（不能删自己）
- 其他 user 行有"删除"按钮
- 不做角色升降
- 分页：每页 20 条

### 删除用户

- `DELETE /api/admin/users/[id]`
- 校验：`req.role === admin` 且 `targetId !== selfId`
- Cascade 删除该用户所有规划数据
- 前端二次确认弹窗

### API 清单

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/admin/stats` | admin | 全站统计 |
| GET | `/api/admin/users` | admin | 用户列表（分页） |
| DELETE | `/api/admin/users/[id]` | admin | 删除指定用户 |
