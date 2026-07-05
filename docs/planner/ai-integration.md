# AI 集成

## SDK 初始化

```text
src/lib/ai/client.ts
  ├── import { createAgent } from '@archships/dim-agent-sdk'
  ├── import { deepseek } from '@archships/dim-agent-sdk/providers/deepseek'
  ├── 读取 process.env.DEEPSEEK_API_KEY
  └── 导出 agent 实例
```

环境变量：

```text
DEEPSEEK_API_KEY=sk-xxx
DEEPSEEK_BASE_URL=https://api.deepseek.com   # 可选，默认即此
DEEPSEEK_MODEL=deepseek-chat                  # 可选
```

## API 路由

| 路由 | 方法 | 输入 | 输出 | 用途 |
|---|---|---|---|---|
| `/api/ai/summarize-profile` | POST | profile 数据 | 结构化总结文本 | 生成个人画像总结 |
| `/api/ai/analyze-gap` | POST | profile + 最新 skill_assessments | 优势/短板/优先补齐 | 差距分析 |
| `/api/ai/generate-plan` | POST | profile + assessments | 30/60/90 任务列表 | 生成学习计划 |
| `/api/ai/review-weekly` | POST | weekly_log + 历史 | 周报分析与建议 | 分析周报 |
| `/api/ai/generate-report` | POST | 全量数据 | 完整规划报告 Markdown | 导出报告 |

## Prompt 设计原则

每个 AI 调用都会组装一个 system prompt + user prompt：

### System Prompt 公共上下文

```text
你是一位 FDE（Forward Deployed Engineer）职业转型顾问。
FDE 能力模型分三大类：
- 客户交付：需求访谈、方案表达、PoC 设计、项目推进、客户排障、文档、UAT/上线
- AI 工程：LLM API、Prompt、RAG、Agent/Workflow、Evals、可观测性、权限安全、部署
- 业务理解：业务流程建模、ROI 指标、行业知识、数据指标、客户成功、商业意识
你的任务是根据用户数据，给出具体、可执行、结构化的建议。
```

### User Prompt

携带具体的 profile / assessment / weekly_log 数据（JSON 或结构化文本）。

## 调用流程

```text
页面按钮点击
  ↓
fetch /api/ai/{endpoint}
  ↓
API 读取数据库最新数据
  ↓
组装 prompt
  ↓
调用 dim-agent-sdk → DeepSeek
  ↓
解析返回
  ↓
写入 ai_summaries 表
  ↓
返回前端展示
```

## 错误处理

| 情况 | 处理 |
|---|---|
| DEEPSEEK_API_KEY 缺失 | 返回 500，提示配置 .env.local |
| SDK 调用失败 | 返回 503，提示重试 |
| 返回内容解析失败 | 返回原始文本，标记 unparseable |
| 数据库读取失败 | 返回 500，提示检查 MySQL |

## 降级策略

如果 AI 不可用，以下功能仍可手动使用：

- 个人画像：手动填写，不依赖 AI
- 技能自评：纯手动
- 学习路线：可手动添加任务
- 每周追踪：纯手动
- 求职清单：纯手动

AI 是增强，不是阻断。
