"use client";

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
  blue: { btn: "bg-brand-600 hover:bg-brand-700", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
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

  const handleClick = async () => {
    reset();
    await run(apiEndpoint, body);
    if (onComplete) {
      // Small delay to let state settle
      setTimeout(onComplete, 100);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <button
          onClick={handleClick}
          disabled={loading}
          className={`px-4 py-2 text-white rounded-md disabled:opacity-50 font-medium text-sm ${accent.btn}`}
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
        <div className={`prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap p-4 rounded border ${accent.bg} ${accent.border}`}>
          {content}
          {loading && (
            <span className={`inline-block w-2 h-4 ml-0.5 animate-pulse ${accent.text}`}>▊</span>
          )}
        </div>
      )}

      {/* Empty state hint */}
      {!content && !error && !loading && (
        <p className="text-sm text-gray-400">
          点击上方按钮，AI 将实时生成分析结果
        </p>
      )}

      {/* Status bar */}
      {loading && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span>正在调用 DeepSeek 模型，实时返回中…</span>
        </div>
      )}

      {done && !error && (
        <div className="text-xs text-green-600">✓ 生成完成，已保存到数据库</div>
      )}
    </div>
  );
}
