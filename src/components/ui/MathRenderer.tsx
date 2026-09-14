import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface MathRendererProps {
  content?: string | null;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = "" }) => {
  if (!content) return null;

  return (
    <div className={`prose-sm max-w-none text-theme-text font-sans ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => <span className="inline-block leading-relaxed mb-1">{children}</span>,
          code: ({ children }) => (
            <span className="font-mono bg-surface-soft px-1.5 py-0.5 rounded text-xs">
              {children}
            </span>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
