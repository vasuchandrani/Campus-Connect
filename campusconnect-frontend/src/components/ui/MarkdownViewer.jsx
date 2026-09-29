import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Reusable Markdown Viewer component with clean, modern styling.
 */
export function MarkdownViewer({ content, className = "" }) {
  if (!content) {
    return <p className="text-xs sm:text-sm text-muted-foreground italic">No content provided.</p>;
  }

  return (
    <div
      className={`markdown-body text-xs sm:text-sm text-foreground/90 leading-relaxed space-y-2.5 overflow-x-auto ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-base sm:text-lg font-bold text-foreground mt-3 mb-1 border-b border-border/60 pb-1" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-sm sm:text-base font-bold text-foreground mt-2.5 mb-1 border-b border-border/40 pb-0.5" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xs sm:text-sm font-bold text-foreground mt-2 mb-0.5" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="whitespace-pre-wrap leading-relaxed my-1" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-0.5 my-1.5 pl-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-0.5 my-1.5 pl-1" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-2 border-primary/60 pl-3 py-0.5 italic text-muted-foreground my-2 bg-primary/5 rounded-r" {...props} />
          ),
          code: ({ node, inline, ...props }) => {
            if (inline) {
              return (
                <code
                  className="bg-muted/70 text-foreground font-mono px-1.5 py-0.5 rounded text-[11px] font-medium border border-border/50"
                  {...props}
                />
              );
            }
            return (
              <pre className="bg-muted/80 text-foreground p-3 rounded-lg overflow-x-auto font-mono text-[11px] sm:text-xs my-2 border border-border/60">
                <code {...props} />
              </pre>
            );
          },
          a: ({ node, ...props }) => (
            <a
              className="text-primary underline underline-offset-2 hover:text-primary/80 font-medium break-words transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-foreground" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-foreground/90" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-3 border-border/60" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-2 rounded-lg border border-border/60">
              <table className="w-full text-left text-xs border-collapse" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="bg-muted/50 p-2 font-semibold text-foreground border-b border-border/60" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="p-2 border-b border-border/40" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownViewer;
