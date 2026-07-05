# AI 集成

## SDK 初始化

```text
src/lib/ai/client.ts
  ├── import { createAgent, createModel, createDeepSeekAdapter } from '@archships/dim-agent-sdk'
  ├── 读取 process.env.DEEPSEEK_API_KEY
  ├── createDeepSeekAdapter({ apiKey, baseUrl, defaultModel })
  ├── createModel(adapter) → ModelClient
  └── 导出 getModel() / chatOnce() / chatStream() / chatMultiTurn()
```

环境变量：

```text
DEEPSEEK_API_KEY=sk-xxx
DEEPSEEK_BASE_URL=https://api.deepseek.com   # 可选，默认即此
DEEPSEEK_MODEL=deepseek-chat                  # 可选
```

## 两种 AI 交互模式

### 模式一：一次性流式

用于画像总结、差距分析、学习计划、周报分析、规划报告。

```text
用户点击 AI 按钮
  ↓
POST /api/ai/{endpoint}
  ↓
API 读取数据库 → 组装 prompt
  ↓
chatStream(systemPrompt, userPrompt, onDelta)
  ↓
SSE: data: {"type":"delta","delta":"...","accumulated":"..."}
  ↓
前端 useAIStream hook 实时读取并展示
  ↓
SSE: data: {"type":"done","full":"..."}
  ↓
保存到 ai_summaries 表
```

实现文件：

- `src/lib/ai/client.ts` — `chatStream()` 流式回调
- `src/lib/ai/stream.ts` — `runStreamingAI()` SSE 封装
- `src/lib/hooks/useAIStream.ts` — 前端 SSE 读取 hook
- `src/components/AIStreamPanel.tsx` — 通用流式展示组件

### 模式二：多轮对话

用于 FDE 顾问自由问答。

```text
用户发送消息
  ↓
POST /api/chat { sessionId?, message }
  ↓
API 获取/创建 chat_session
  ↓
保存 user message 到 chat_messages
  ↓
加载历史消息 → 组装多轮 messages 数组
  ↓
chatMultiTurn(messages, onDelta)
  ↓
SSE: data: {"type":"delta","delta":"...","accumulated":"..."}
  ↓
SSE: data: {"type":"done","full":"...","sessionId":123}
  ↓
保存 assistant message 到 chat_messages
```

实现文件：

- `src/lib/ai/client.ts` — `chatMultiTurn()` 多轮对话 + 流式
- `src/app/api/chat/route.ts` — POST 发送消息（SSE 流式）、GET 会话列表
- `src/app/api/chat/[id]/route.ts` — GET 会话详情、DELETE 删除会话
- `src/components/ChatInterface.tsx` — 完整对话界面

## API 路由

| 路由 | 方法 | 模式 | 用途 |
|---|---|---|---|
| `/api/ai/summarize-profile` | POST | 一次性流式 | 生成个人画像总结 |
| `/api/ai/analyze-gap` | POST | 一次性流式 | 差距分析 |
| `/api/ai/generate-plan` | POST | 一次性流式 | 生成学习计划 |
| `/api/ai/review-weekly` | POST | 一次性流式 | 分析周报 |
| `/api/ai/generate-report` | POST | 一次性流式 | 导出报告 |
| `/api/chat` | GET | — | 会话列表 |
| `/api/chat` | POST | 多轮对话流式 | 发送消息 |
| `/api/chat/[id]` | GET | — | 会话详情 |
| `/api/chat/[id]` | DELETE | — | 删除会话 |

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

### 多轮对话上下文

对话模式中，system prompt + 全部历史消息（user/assistant 交替）一起传入 `chatMultiTurn()`，保持上下文记忆。

## 错误处理

| 情况 | 处理 |
|---|---|
| DEEPSEEK_API_KEY 缺失 | 返回 500，提示配置 .env.local |
| SDK 调用失败 | SSE 返回 error 事件，前端展示错误 |
| 返回内容解析失败 | 返回原始文本 |
| 数据库读取失败 | 返回 500，提示检查 MySQL |
| 对话 sessionId 不存在 | 返回 404 |
| 对话消息为空 | 返回 400 |

## 降级策略

如果 AI 不可用，以下功能仍可手动使用：

- 个人画像：手动填写，不依赖 AI
- 技能自评：纯手动
- 学习路线：可手动添加任务
- 每周追踪：纯手动
- 求职清单：纯手动

AI 是增强，不是阻断。
