# 数据模型

## 表结构

### users — 用户账号

| 字段 | 类型 | 说明 |
|---|---|---|
| id | Int PK | 主键 |
| email | String @unique | 邮箱 |
| passwordHash | String | bcrypt 哈希（cost 10） |
| nickname | String @default("") | 昵称，空则取邮箱 @ 前部分 |
| avatarSeed | String @default("") | DiceBear 头像种子 |
| role | String @default("user") | "user" \| "admin" |
| createdAt | DateTime @default(now()) | 注册时间 |
| updatedAt | DateTime @updatedAt | 更新时间 |

第一个注册用户自动 `role = admin`，之后为 `user`。

---

### profiles — 个人画像

| 字段 | 类型 | 说明 |
|---|---|---|
| id | Int PK | 主键 |
| userId | Int FK → users.id | 所属用户（Cascade） |
| current_role | String | 当前岗位 |
| years_of_experience | Int | 工作年限 |
| tech_stack | String | 技术栈，逗号分隔或自由文本 |
| project_experience | Text | 项目经历描述 |
| has_customer_communication | Boolean | 是否做过客户沟通 |
| has_tob_delivery | Boolean | 是否做过 ToB / 交付 / 售前 / 实施 |
| has_ai_experience | Boolean | 是否做过 AI / RAG / Agent |
| can_travel | Boolean | 是否能接受出差 |
| target_role_type | String | 目标岗位类型 |
| target_salary | String | 目标薪资 |
| weekly_study_hours | Int | 每周可投入学习时间 |
| preferred_industries | String | 偏好行业方向 |
| created_at | DateTime | 创建时间 |
| updated_at | DateTime | 更新时间 |

每个用户一条记录，按 userId 取，更新覆盖。

---

### skill_assessments — 技能评分

| 字段 | 类型 | 说明 |
|---|---|---|
| id | Int PK | |
| userId | Int FK → users.id | 所属用户（Cascade） |
| category | String | delivery / ai_engineering / business |
| skill_key | String | 如 requirement_interview |
| score | Int | 1-5 |
| assessed_at | DateTime | 评分时间 |

每次评分写入新记录，用于历史对比。

---

### learning_tasks — 学习任务

| 字段 | 类型 | 说明 |
|---|---|---|
| id | Int PK | |
| userId | Int FK → users.id | 所属用户（Cascade） |
| phase | String | 30 / 60 / 90 |
| title | String | 任务名 |
| category | String | delivery / ai_engineering / business |
| priority | String | high / medium / low |
| status | String | pending / in_progress / done |
| due_date | DateTime? | 截止日期 |
| notes | Text? | 备注 |
| created_at | DateTime | |

---

### weekly_logs — 每周追踪

| 字段 | 类型 | 说明 |
|---|---|---|
| id | Int PK | |
| userId | Int FK → users.id | 所属用户（Cascade） |
| week_number | Int | 第几周 |
| learned | Text | 本周学习了什么 |
| project_progress | Text | 项目进展 |
| problems | Text | 遇到的问题 |
| delivery_practice | Int | 客户交付训练自评 1-5 |
| ai_practice | Int | AI 工程训练自评 1-5 |
| business_practice | Int | 业务理解训练自评 1-5 |
| next_week_plan | Text | 下周计划 |
| created_at | DateTime | |

---

### job_checklist_items — 求职准备清单

| 字段 | 类型 | 说明 |
|---|---|---|
| id | Int PK | |
| userId | Int FK → users.id | 所属用户（Cascade） |
| section | String | resume / portfolio / interview / salary |
| title | String | 清单项名称 |
| is_done | Boolean | 是否完成 |
| notes | Text? | 备注 |
| sort_order | Int | 排序 |

---

### ai_summaries — AI 生成的总结

| 字段 | 类型 | 说明 |
|---|---|---|
| id | Int PK | |
| userId | Int FK → users.id | 所属用户（Cascade） |
| type | String | profile_summary / gap_analysis / learning_plan / weekly_review / full_report |
| content | Text | AI 返回的结构化内容 |
| related_id | Int? | 关联的记录 id（如 weekly_log id） |
| created_at | DateTime | |

---

### chat_sessions — 对话会话

| 字段 | 类型 | 说明 |
|---|---|---|
| id | Int PK | |
| userId | Int FK → users.id | 所属用户（Cascade） |
| title | String | 会话标题（取首条消息前 30 字） |
| created_at | DateTime | |
| updated_at | DateTime | |

---

### chat_messages — 对话消息

| 字段 | 类型 | 说明 |
|---|---|---|
| id | Int PK | |
| session_id | Int FK | 关联 chat_sessions.id |
| role | String | user / assistant |
| content | Text | 消息内容 |
| created_at | DateTime | |

## ER 关系

```text
users (1)
  └─ profiles (N)              by userId, 实际每用户 1 条
  └─ skill_assessments (N)
  └─ learning_tasks (N)
  └─ weekly_logs (N)
  └─ job_checklist_items (N)
  └─ ai_summaries (N)
  └─ chat_sessions (N)
       └─ chat_messages (N)    FK: session_id → chat_sessions.id (CASCADE)
```

所有业务表通过 `userId` 外键显式关联 `users`，`onDelete: Cascade`。`chat_messages` 不直接加 userId，靠 `session_id` 间接归属用户。

## Seed 数据

注册新用户时调用 `seedForUser(userId)` 初始化：

1. 默认 job_checklist_items（简历/作品集/面试/薪资模板）
2. 默认 learning_tasks 骨架（30/60/90 三阶段空任务）

不 seed profile 和 skill_assessments，由用户填写。
