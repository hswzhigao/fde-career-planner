"use client";

import { useState, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

/** Copy button for code blocks */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 px-2 py-1 text-xs rounded-md bg-stone-700/80 text-stone-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-stone-600 z-10"
    >
      {copied ? "已复制 ✓" : "复制"}
    </button>
  );
}

/** Extract language label from className like "language-js" */
function getLanguage(className?: string): string | null {
  const match = className?.match(/language-(\w+)/);
  return match ? match[1] : null;
}

/** Custom code block renderer with copy button and language label */
function CodeBlock({ className, children }: { className?: string; children?: React.ReactNode }) {
  const isInline = !className;
  const text = typeof children === "string" ? children : String(children ?? "");
  const lang = getLanguage(className);

  if (isInline) {
    return (
      <code className="px-1.5 py-0.5 rounded bg-stone-100 text-orange-700 text-[0.85em] font-mono break-words">
        {children}
      </code>
    );
  }

  return (
    <div className="group relative my-3 rounded-xl overflow-hidden border border-stone-700/30">
      {/* Header bar with language label */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-stone-800 border-b border-stone-700/50">
        <span className="text-xs text-stone-400 font-mono">{lang || "code"}</span>
      </div>
      <CopyButton text={text} />
      <pre className="overflow-x-auto bg-stone-900 p-4 text-sm leading-relaxed !mt-0 !rounded-none">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

function MarkdownContentImpl({ content }: { content: string }) {
  return (
    <div className="
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

      [&_pre]:!bg-stone-900
      [&_pre_code]:!bg-transparent [&_pre_code]:!p-0

      [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-3
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={{
          code: CodeBlock as never,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export const MarkdownContent = memo(MarkdownContentImpl);
