"use client";
import { useState } from "react";
import styles from "./Evidence.module.css";

export default function ExpandablePre({ content, className, codeClassName, label, maxLines = 20 }) {
  const lines = (content || "").split("\n");
  const isLong = lines.length > maxLines;
  const [expanded, setExpanded] = useState(false);

  const displayContent = isLong && !expanded
    ? lines.slice(0, maxLines).join("\n") + "\n…"
    : content;

  return (
    <>
      <pre className={className} tabIndex={0} aria-label={label}>
        <code className={codeClassName}>{displayContent?.trim()}</code>
      </pre>
      {isLong && (
        <button
          className={styles.expandBtn}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? `▲ Collapse (${lines.length} lines)` : `▼ Show all ${lines.length} lines`}
        </button>
      )}
    </>
  );
}
