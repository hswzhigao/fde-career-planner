"use client";

import { useState, memo, type ReactNode, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Add copy buttons to all <pre> elements via DOM manipulation */
function usePreCopyButtons(rootRef: React.RefObject<HTMLDivElement | null>, content: string) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const pres = root.querySelectorAll("pre");
    const wrappers: HTMLDivElement[] = [];

    pres.forEach((pre) => {
      // Wrap pre in a relative container
      const wrapper = document.createElement("div");
      wrapper.className = "group relative my-3 rounded-xl overflow-hidden border border-stone-700/30";
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      // Remove default pre styling (we use wrapper)
      pre.className = "overflow-x-auto bg-stone-900 p-4 text-sm leading-relaxed !my-0 !rounded-none";
      pre.classList.add("group");

      // Add copy button
      const btn = document.createElement("button");
      btn.className =
        "absolute top-2 right-2 z-10 px-2 py-1 text-xs rounded-md " +
        "bg-stone-700/80 text-stone-200 opacity-0 group-hover:opacity-100 " +
        "transition-opacity hover:bg-stone-600";
      btn.textContent = "复制";
      btn.addEventListener("click", async () => {
        const text = pre.textContent ?? "";
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = "已复制 ✓";
          setTimeout(() => { btn.textContent = "复制"; }, 2000);
        } catch {
          // ignore
        }
      });
      wrapper.appendChild(btn);
      wrappers.push(wrapper);
    });

    return () => {
      // Unwrap: move pre back to original parent, remove wrapper
      wrappers.forEach((w) => {
        const pre = w.querySelector("pre");
        if (pre) w.parentNode?.insertBefore(pre, w);
        w.remove();
      });
    };
  }, [rootRef, content]);
}

function MarkdownContentImpl({ content }: { content: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  // Ensure fenced code blocks are preceded by a blank line (Markdown spec requirement).
  // AI outputs sometimes put ``` directly after text without any newline.
  const normalized = content
    .replace(/([^\n])```/g, "$1\n\n```")
    .replace(/\n```/g, "\n\n```")
    .replace(/\n\n\n+```/g, "\n\n```");

  usePreCopyButtons(rootRef, normalized);

  return (
    <div
      ref={rootRef}
      className="
      text-[15px] leading-[1.75] text-stone-700

      [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-stone-900 [&_h1]:mt-5 [&_h1]:mb-2.5
      [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-stone-900 [&_h2]:mt-5 [&_h2]:mb-2.5
      [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-stone-900 [&_h3]:mt-4 [&_h3]:mb-2
      [&_h4]:text-[15px] [&_h4]:font-semibold [&_h4]:text-stone-900 [&_h4]:mt-3.5 [&_h4]:mb-1.5
      [&_h5]:text-sm [&_h5]:font-semibold [&_h5]:text-stone-800 [&_h5]:mt-3 [&_h5]:mb-1

      [&_p]:my-2 [&_p]:leading-[1.75]

      [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
      [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
      [&_li]:leading-[1.7] [&_li]:marker:text-stone-400

      [&_blockquote]:border-l-[3px] [&_blockquote]:border-orange-300
      [&_blockquote]:bg-orange-50/60 [&_blockquote]:pl-3.5 [&_blockquote]:pr-3
      [&_blockquote]:py-2 [&_blockquote]:rounded-r-lg [&_blockquote]:my-3
      [&_blockquote]:text-stone-600 [&_blockquote]:text-sm

      [&_a]:text-orange-600 [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-orange-700

      [&_strong]:font-semibold [&_strong]:text-stone-900

      [&_hr]:border-orange-100 [&_hr]:my-4

      [&_table]:w-full [&_table]:my-3 [&_table]:text-sm [&_table]:border-collapse
      [&_thead]:bg-orange-50
      [&_th]:border [&_th]:border-orange-100 [&_th]:px-3 [&_th]:py-2 [&_th]:font-semibold [&_th]:text-stone-900 [&_th]:text-left
      [&_td]:border [&_td]:border-orange-100 [&_td]:px-3 [&_td]:py-2 [&_td]:text-stone-600
      [&_tr:nth-child(even)]:bg-orange-50/30

      [&_pre]:bg-stone-900 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:my-3
      [&_pre]:overflow-x-auto [&_pre]:text-sm [&_pre]:leading-relaxed
      [&_pre_code]:!bg-transparent [&_pre_code]:!p-0 [&_pre_code]:!text-stone-100 [&_pre_code]:!font-mono

      [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded
      [&_:not(pre)>code]:bg-stone-100 [&_:not(pre)>code]:text-orange-700
      [&_:not(pre)>code]:text-[0.85em] [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:break-words

      [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-3
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        children={normalized}
      />
    </div>
  );
}

export const MarkdownContent = memo(MarkdownContentImpl);
