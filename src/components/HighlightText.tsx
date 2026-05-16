import React from "react";

interface HighlightTextProps {
  text: string;
  highlight?: string;
}

export function HighlightText({ text, highlight }: HighlightTextProps) {
  if (!highlight || !highlight.trim()) {
    return <>{text}</>;
  }

  // Escape special regex characters
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedHighlight})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-[#FEFD99]/70 text-slate-950 font-extra   rounded-xs px-0.5 border-b border-slate-400/40">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
