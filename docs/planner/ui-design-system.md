# UI 设计系统 — 学习成长温暖风

## 设计目标

将现有 Tailwind 蓝色主调 + 冷灰背景的朴素风格，重构为温暖、鼓励、成长感的视觉体验，参考 Duolingo 等学习产品的风格。

## 色彩系统

### 主色 warm（琥珀/橙系）

| 色阶 | 值 | 用途 |
|---|---|---|
| warm-50 | #FFF7ED | 浅底/高亮背景 |
| warm-100 | #FFEDD5 | hover 底 |
| warm-200 | #FED7AA | 边框 |
| warm-400 | #FB923C | 次要强调 |
| warm-500 | #F97316 | 主按钮/链接 |
| warm-600 | #EA580C | 主按钮 hover |
| warm-700 | #C2410C | 深色文字 |

### 辅助色

| 色名 | 值 | 用途 |
|---|---|---|
| success | #16A34A | 完成状态 |
| warning | #F59E0B | 警告/进行中 |
| danger | #DC2626 | 删除/错误 |

### 中性色

| 色名 | 值 | 用途 |
|---|---|---|
| bg-page | #FAF9F6 | 页面底色（暖白，替代冷灰 gray-50） |
| card-bg | #FFFFFF | 卡片 |
| border | #F5E6D8 | 暖色边框（替代 gray-200） |
| text | #292524 | 主文字（warm 系深灰） |
| text-mute | #78716C | 次要文字 |

## 排版与圆角

| 元素 | 现状 | 调整 |
|---|---|---|
| 卡片圆角 | `rounded-lg` (8px) | `rounded-2xl` (16px) |
| 按钮圆角 | `rounded-lg` | `rounded-xl` (12px) |
| 卡片阴影 | `shadow-sm` | `shadow-sm` + `shadow-orange-100/50` |
| 卡片边框 | `border-gray-200` | `border-warm-200` 或无边框纯阴影 |
| 页面底色 | `bg-gray-50` | `bg-warm-50/40`（暖白） |
| 主标题 | `text-2xl font-bold` | `text-2xl font-bold text-stone-800` |

## 组件样式规范

### Card

```text
className="bg-white rounded-2xl shadow-sm shadow-orange-100/40 p-6"
```

### Button

- 主按钮：`bg-warm-500 text-white rounded-xl px-4 py-2 hover:bg-warm-600`
- 次要按钮：`bg-warm-50 text-warm-700 rounded-xl px-4 py-2 hover:bg-warm-100`
- 危险按钮：`bg-danger text-white rounded-xl px-4 py-2 hover:bg-red-700`
- 禁用：`opacity-50 cursor-not-allowed`

### Progress

- 轨道：`bg-warm-100 rounded-full h-2`
- 填充：`bg-warm-500 rounded-full h-2 transition-all`

### Input

```text
className="bg-white border border-warm-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-warm-300 focus:border-warm-400"
```

### Sidebar

- 底色从纯白改 `bg-stone-50`（暖白）
- 激活态：`bg-warm-50 text-warm-700 border-r-2 border-warm-500`
- 底部用户区：头像 + 昵称 + 下拉（个人中心/管理后台/登出）

### EmptyState

```text
┌─────────────────────────────────┐
│         🌱                       │
│  还没有填写个人画像               │
│  花几分钟告诉我你的背景，         │
│  我来帮你规划转型路线 →           │
│  [开始填写]                      │
└─────────────────────────────────┘
```

### Badge

- 阶段标签：`bg-warm-100 text-warm-700 rounded-full px-2.5 py-0.5 text-xs`
- 完成徽章：`bg-success/10 text-success rounded-full px-2.5 py-0.5 text-xs`

## 页面级布局

```text
┌─────────────────────────────────────────────────────┐
│ Sidebar  │  TopBar（页面标题 + 用户头像）           │
│ (固定)   ├──────────────────────────────────────────┤
│          │                                          │
│  导航项   │  主内容区（暖白底，max-width 居中）       │
│          │                                          │
│ ─────── │                                          │
│ 用户区   │                                          │
│ 头像+名  │                                          │
│ ▾ 菜单   │                                          │
└──────────┴──────────────────────────────────────────┘
```

新增 TopBar：显示当前页面标题 + 右侧用户头像（点击下拉菜单：个人中心/管理后台/登出）。

## 组件清单

### 受影响组件（11 个全改）

| 组件 | 主要改动 |
|---|---|
| Sidebar | 暖色底 + 底部用户区 + 头像下拉 |
| Dashboard | 暖色卡片 + 鼓励文案 + 阶段徽章 |
| ProfileForm | 暖色表单 + 空状态引导 |
| SkillAssessment | 暖色评分 + 雷达图配色 |
| GapAnalysisView | 暖色卡片层级 |
| LearningBoard | 进度条配色 + 任务勾选暖色 |
| WeeklyForm | 表单 + 周报卡片 |
| JobChecklist | 清单勾选 + 完成徽章 |
| ChatInterface | 对话气泡暖色 |
| ExportView | 导出卡片 |
| AIStreamPanel | 流式输出容器暖色 |

### 新增组件

| 组件 | 说明 |
|---|---|
| TopBar | 顶部栏（标题 + 用户菜单） |
| UserMenu | 头像下拉菜单 |
| Card | 统一卡片封装 |
| Button | 统一按钮封装 |
| Badge | 阶段/状态徽章 |
| EmptyState | 空状态 + 鼓励文案 |
| ConfirmDialog | 二次确认弹窗（删账号/删用户用） |
| LoginForm / RegisterForm | 认证表单 |
