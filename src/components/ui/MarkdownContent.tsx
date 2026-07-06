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
      className="absolute top-2 right-2 px-2 py-1 text-xs rounded-md bg-stone-700/80 text-stone-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-stone-600"
    >
      {copied ? "已复制 ✓" : "复制"}
    </button>
  );
}

/** Custom code block renderer with copy button */
function CodeBlock({ className, children }: { className?: string; children?: React.ReactNode }) {
  const isInline = !className;
  const text = typeof children === "string" ? children : String(children ?? "");

  if (isInline) {
    return (
      <code className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 text-[0.85em] font-mono">
        {children}
      </code>
    );
  }

  return (
    <div className="group relative my-3">
      <CopyButton text={text} />
      <pre className="overflow-x-auto rounded-xl bg-stone-900 p-4 text-sm">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

function MarkdownContentImpl({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none text-stone-700
      prose-headings:text-stone-900 prose-headings:font-semibold
      prose-h1:text-xl prose-h1:mt-4 prose-h1:mb-2
      prose-h2:text-lg prose-h2:mt-4 prose-h2:mb-2
      prose-h3:text-base prose-h3:mt-3 prose-h3:mb-1
      prose-p:my-2 prose-p:leading-relaxed
      prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5
      prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-5
      prose-li:my-0.5
      prose-blockquote:border-l-orange-300 prose-blockquote:bg-orange-50/50 prose-blockquote:py-1 prose-blockquote:pl-3 prose-blockquote:rounded-r
      prose-table:my-3 prose-table:w-full prose-table:text-sm
      prose-th:bg-orange-50 prose-th:text-stone-900 prose-th:font-semibold prose-th:px-3 prose-th:py-1.5 prose-th:border prose-th:border-orange-100
      prose-td:px-3 prose-td:py-1.5 prose-td:border prose-td:border-orange-100
      prose-a:text-orange-600 prose-a:underline
      prose-strong:text-stone-900
      prose-hr:border-orange-100
      [&_pre]:!bg-stone-900
      [&_pre_code]:!bg-transparent
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
