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
          <mark key={i} className="bg-yellow-100 text-[#1D4ED8] font-bold rounded-sm px-0.5 shadow-sm">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
