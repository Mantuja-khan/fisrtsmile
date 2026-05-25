import React from "react";

interface HighlightTextProps {
  text: string;
  highlight?: string;
  className?: string;
}

export function HighlightText({ text, highlight, className }: HighlightTextProps) {
  if (!highlight || !highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  // Escape special regex characters
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedHighlight})`, "gi");
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-[#FEFD99]/70 text-slate-950 font-extra   rounded-xs px-0.5 border-b border-slate-400/40"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}
