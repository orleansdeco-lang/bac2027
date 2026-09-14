import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export interface MathRendererProps {
  content?: string | null;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = "" }) => {
  if (!content) return null;

  return (
    <div className={`prose-sm max-w-none text-theme-text font-sans math-container ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
        components={{
          p: ({ children }) => (
            <p className="leading-relaxed mb-2 last:mb-0 text-inherit">
              {children}
            </p>
          ),
          code: ({ children }) => (
            <code className="font-mono bg-surface-soft px-1.5 py-0.5 rounded text-xs border border-theme/60 text-emerald-800">
              {children}
            </code>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-slate-900">
              {children}
            </strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

