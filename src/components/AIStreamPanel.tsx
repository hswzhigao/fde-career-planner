"use client";

import { useState } from "react";
import { useAIStream } from "@/lib/hooks/useAIStream";

interface AIStreamPanelProps {
  title: string;
  buttonLabel: string;
  apiEndpoint: string;
  body?: Record<string, unknown>;
  onComplete?: () => void;
  accentColor?: "purple" | "blue" | "green";
}

const ACCENTS = {
  purple: { btn: "bg-purple-600 hover:bg-purple-700", bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  blue: { btn: "bg-orange-500 hover:bg-orange-600", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  green: { btn: "bg-green-600 hover:bg-green-700", bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
};

export default function AIStreamPanel({
  title,
  buttonLabel,
  apiEndpoint,
  body,
  onComplete,
  accentColor = "purple",
}: AIStreamPanelProps) {
  const { loading, content, error, done, run, reset } = useAIStream();
  const accent = ACCENTS[accentColor];

  // Follow-up Q&A state
  const [followups, setFollowups] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [followupInput, setFollowupInput] = useState("");
  const [followupLoading, setFollowupLoading] = useState(false);
  const [followupStreaming, setFollowupStreaming] = useState("");

  const handleClick = async () => {
    reset();
    setFollowups([]);
    setFollowupStreaming("");
    await run(apiEndpoint, body);
    if (onComplete) {
      setTimeout(onComplete, 100);
    }
  };

  const sendFollowup = async () => {
    if (!followupInput.trim() || followupLoading) return;

    const userMsg = { role: "user" as const, content: followupInput };
    const newFollowups = [...followups, userMsg];
    setFollowups(newFollowups);
    setFollowupInput("");
    setFollowupLoading(true);
    setFollowupStreaming("");

    try {
      const res = await fetch("/api/ai/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          previousContent: content,
          followupHistory: followups,
          question: followupInput,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "请求失败" }));
        setFollowups((prev) => [...prev, { role: "assistant", content: `错误: ${data.error}` }]);
        setFollowupLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setFollowupLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "delta") {
                full = data.accumulated;
                setFollowupStreaming(data.accumulated);
              } else if (data.type === "done") {
                full = data.full;
              } else if (data.type === "error") {
                full = `错误: ${data.error}`;
              }
            } catch {
              // ignore
            }
          }
        }
      }

      setFollowups((prev) => [...prev, { role: "assistant", content: full }]);
      setFollowupStreaming("");
    } catch (e) {
      setFollowups((prev) => [
        ...prev,
        { role: "assistant", content: `错误: ${e instanceof Error ? e.message : "未知"}` },
      ]);
    } finally {
      setFollowupLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
        <button
          onClick={handleClick}
          disabled={loading}
          className={`px-4 py-2 text-white rounded-xl disabled:opacity-50 font-medium text-sm ${accent.btn}`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              AI 正在生成…
            </span>
          ) : (
            buttonLabel
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
          ⚠ {error}
        </div>
      )}

      {/* Streaming content */}
      {content && (
        <div className={`prose prose-sm max-w-none text-stone-700 whitespace-pre-wrap p-4 rounded border ${accent.bg} ${accent.border}`}>
          {content}
          {loading && (
            <span className={`inline-block w-2 h-4 ml-0.5 animate-pulse ${accent.text}`}>▊</span>
          )}
        </div>
      )}

      {/* Empty state hint */}
      {!content && !error && !loading && (
        <p className="text-sm text-stone-400">
          点击上方按钮，AI 将实时生成分析结果
        </p>
      )}

      {/* Status bar */}
      {loading && (
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span>正在调用 DeepSeek 模型，实时返回中…</span>
        </div>
      )}

      {done && !error && (
        <div className="text-xs text-green-600">✓ 生成完成，已保存到数据库</div>
      )}

      {/* Follow-up Q&A — only show after initial result is done */}
      {done && !error && content && (
        <div className="border-t border-orange-100 pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-stone-700">追问</span>
            <span className="text-xs text-stone-400">基于上面的结果继续提问</span>
          </div>

          {/* Follow-up conversation history */}
          {followups.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {followups.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-orange-500 text-white rounded-br-sm"
                        : `text-stone-700 rounded-bl-sm ${accent.bg} ${accent.border} border`
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Streaming follow-up response */}
          {followupStreaming && (
            <div className="flex justify-start">
              <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm text-stone-700 rounded-bl-sm ${accent.bg} ${accent.border} border whitespace-pre-wrap`}>
                {followupStreaming}
                <span className={`inline-block w-2 h-4 ml-0.5 animate-pulse ${accent.text}`}>▊</span>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {followupLoading && !followupStreaming && (
            <div className="flex justify-start">
              <div className={`px-3 py-2 rounded-2xl text-stone-400 rounded-bl-sm ${accent.bg} ${accent.border} border`}>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {/* Follow-up input */}
          <div className="flex gap-2">
            <textarea
              value={followupInput}
              onChange={(e) => setFollowupInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendFollowup();
                }
              }}
              placeholder="输入追问…（Enter 发送，Shift+Enter 换行）"
              rows={1}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              style={{ maxHeight: "100px" }}
            />
            <button
              onClick={sendFollowup}
              disabled={followupLoading || !followupInput.trim()}
              className="px-4 py-2 bg-stone-700 text-white rounded-xl text-sm font-medium hover:bg-stone-800 disabled:opacity-50"
            >
              {followupLoading ? "…" : "追问"}
            </button>
          </div>

          {/* Quick suggestion buttons */}
          {followups.length === 0 && !followupLoading && (
            <div className="flex flex-wrap gap-2">
              {["给我详细的学习计划", "怎么补齐这个短板？", "帮我改简历"].map((q) => (
                <button
                  key={q}
                  onClick={() => setFollowupInput(q)}
                  className="text-xs px-3 py-1 bg-orange-50/40 text-stone-600 rounded-full border border-orange-100 hover:bg-orange-100"
                >
                  💬 {q}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
