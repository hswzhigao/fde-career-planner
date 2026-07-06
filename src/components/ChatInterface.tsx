"use client";

import { useEffect, useState, useRef } from "react";

interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export default function ChatInterface() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load session list
  const loadSessions = () => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d) => setSessions(d));
  };

  useEffect(() => loadSessions(), []);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  // Load session messages
  const openSession = async (id: number) => {
    abortRef.current?.abort();
    setCurrentSessionId(id);
    setStreamingContent("");
    setError(null);
    const res = await fetch(`/api/chat/${id}`);
    const data = await res.json();
    setMessages(
      data.messages?.map((m: { role: string; content: string; id: number }) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
      })) || [],
    );
  };

  const newChat = () => {
    abortRef.current?.abort();
    setCurrentSessionId(null);
    setMessages([]);
    setStreamingContent("");
    setInput("");
    setError(null);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    abortRef.current?.abort();

    const userMsg: Message = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    setStreamingContent("");
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: currentSessionId, message: userMsg.content }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "请求失败" }));
        setError(data.error);
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError("无法读取流");
        setLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";
      let newSessionId = currentSessionId;

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
                fullContent = data.accumulated;
                setStreamingContent(data.accumulated);
              } else if (data.type === "done") {
                fullContent = data.full;
                newSessionId = data.sessionId;
                setStreamingContent("");
                setMessages((m) => [...m, { role: "assistant", content: data.full }]);
              } else if (data.type === "error") {
                setError(data.error);
              }
            } catch {
              // ignore
            }
          }
        }
      }

      // Update session ID if new
      if (newSessionId !== currentSessionId && newSessionId) {
        setCurrentSessionId(newSessionId);
      }
      loadSessions();
    } catch (e) {
      if (e instanceof Error && e.name !== "AbortError") {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (id: number) => {
    await fetch(`/api/chat/${id}`, { method: "DELETE" });
    if (currentSessionId === id) {
      newChat();
    }
    loadSessions();
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      {/* Session list */}
      <div className="w-56 shrink-0 bg-white rounded-2xl shadow-sm border border-orange-100 flex flex-col">
        <button
          onClick={newChat}
          className="m-3 px-3 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600"
        >
          + 新对话
        </button>
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
          {sessions.length === 0 && (
            <p className="text-xs text-stone-400 text-center py-4">暂无历史对话</p>
          )}
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`group flex items-center gap-1 px-2 py-2 rounded cursor-pointer text-sm ${
                currentSessionId === s.id ? "bg-orange-50 text-orange-700" : "hover:bg-orange-50/40 text-stone-600"
              }`}
              onClick={() => openSession(s.id)}
            >
              <span className="flex-1 truncate">{s.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(s.id);
                }}
                className="text-xs text-red-400 opacity-0 group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-orange-100">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && !streamingContent && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">FDE 顾问对话</h3>
              <p className="text-sm text-stone-500 max-w-md">
                向我提问任何关于 FDE 转型的问题，例如：
              </p>
              <div className="mt-4 space-y-2">
                {[
                  "我后端开发 5 年，转 FDE 需要学什么？",
                  "RAG 和 Agent 先学哪个？",
                  "FDE 面试会问什么？",
                  "怎么做一个能打动面试官的作品集？",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="block w-full text-left px-4 py-2 text-sm text-stone-600 bg-orange-50/40 rounded-xl hover:bg-orange-100 border border-orange-100"
                  >
                    💬 {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-orange-500 text-white rounded-br-sm"
                    : "bg-orange-50 text-stone-800 rounded-bl-sm"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>
            </div>
          ))}

          {/* Streaming content */}
          {streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-orange-50 text-stone-800 rounded-bl-sm">
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {streamingContent}
                  <span className="inline-block w-2 h-4 ml-0.5 animate-pulse text-orange-600">▊</span>
                </div>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {loading && !streamingContent && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl bg-orange-50 text-stone-400 rounded-bl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
              ⚠ {error}
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-orange-100 p-4">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="输入你的问题…（Enter 发送，Shift+Enter 换行）"
              rows={1}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              style={{ maxHeight: "120px" }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="px-5 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? "发送中…" : "发送"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
