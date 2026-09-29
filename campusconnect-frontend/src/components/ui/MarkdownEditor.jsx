import React, { useState, useRef } from "react";
import { MarkdownViewer } from "./MarkdownViewer";
import { Bold, Italic, Heading, List, Link as LinkIcon, Code, Quote, Eye, Edit3 } from "lucide-react";

export function MarkdownEditor({
  value = "",
  onChange,
  placeholder = "Write your announcement in Markdown...",
  rows = 6,
  minHeight = "160px",
  className = "",
  id,
  name,
}) {
  const [activeTab, setActiveTab] = useState("write"); // 'write' | 'preview'
  const textareaRef = useRef(null);

  const insertMarkdown = (prefix, suffix = "", defaultText = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);

    if (onChange) {
      onChange(newValue);
    }

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(
        start + prefix.length,
        newCursorPos
      );
    }, 0);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Tab Switcher & Quick Formatting Bar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1 border-b border-border/60">
        <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-lg border border-border/40">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === "write"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === "preview"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>

        {activeTab === "write" && (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              title="Bold"
              onClick={() => insertMarkdown("**", "**", "bold text")}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Italic"
              onClick={() => insertMarkdown("*", "*", "italic text")}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Heading"
              onClick={() => insertMarkdown("### ", "", "Heading")}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <Heading className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Bullet List"
              onClick={() => insertMarkdown("- ", "", "List item")}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Link"
              onClick={() => insertMarkdown("[", "](https://example.com)", "Link text")}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Quote"
              onClick={() => insertMarkdown("> ", "", "Important notice")}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Code"
              onClick={() => insertMarkdown("`", "`", "code")}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Editor Body */}
      {activeTab === "write" ? (
        <div>
          <textarea
            id={id}
            name={name}
            ref={textareaRef}
            rows={rows}
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            placeholder={placeholder}
            style={{ minHeight }}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs sm:text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 font-mono leading-relaxed"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Markdown formatted: supports headers, <strong>**bold**</strong>, lists, links, quotes, and code.
          </p>
        </div>
      ) : (
        <div
          style={{ minHeight }}
          className="rounded-md border border-border/60 bg-muted/15 p-3 overflow-y-auto max-h-[300px]"
        >
          {value.trim() ? (
            <MarkdownViewer content={value} />
          ) : (
            <p className="text-xs text-muted-foreground italic py-4 text-center">
              Nothing to preview yet. Switch to the <strong>Write</strong> tab to add content.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default MarkdownEditor;
