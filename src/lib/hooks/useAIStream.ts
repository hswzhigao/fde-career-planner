"use client";

import { useState, useCallback, useRef } from "react";

interface StreamState {
  loading: boolean;
  content: string;
  error: string | null;
  done: boolean;
}

/**
 * Hook for streaming AI responses via Server-Sent Events.
 * Usage:
 *   const { loading, content, error, run } = useAIStream();
 *   run("/api/ai/summarize-profile");
 */
export function useAIStream() {
  const [state, setState] = useState<StreamState>({
    loading: false,
    content: "",
    error: null,
    done: false,
  });
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async (url: string, body?: Record<string, unknown>) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ loading: true, content: "", error: null, done: false });

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "请求失败" }));
        setState({ loading: false, content: "", error: data.error, done: true });
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setState({ loading: false, content: "", error: "无法读取流", done: true });
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

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
                setState((prev) => ({
                  ...prev,
                  content: data.accumulated,
                }));
              } else if (data.type === "done") {
                setState((prev) => ({
                  ...prev,
                  loading: false,
                  done: true,
                  content: data.full,
                }));
              } else if (data.type === "error") {
                setState((prev) => ({
                  ...prev,
                  loading: false,
                  done: true,
                  error: data.error,
                }));
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setState({
        loading: false,
        content: "",
        error: e instanceof Error ? e.message : "未知错误",
        done: true,
      });
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ loading: false, content: "", error: null, done: false });
  }, []);

  const setContent = useCallback((content: string) => {
    setState({ loading: false, content, error: null, done: content.length > 0 });
  }, []);

  return { ...state, run, reset, setContent };
}
