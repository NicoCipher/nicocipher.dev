"use client";

import { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import styles from "./LivePreview.module.css";

export default function LivePreview({ body = "" }) {
  const [html, setHtml] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        const rendered = marked(body, { gfm: true, breaks: false });
        setHtml(rendered);
      } catch {
        setHtml("<p style='color: var(--status-warn)'>Markdown parse error</p>");
      }
    }, 300);

    return () => clearTimeout(timerRef.current);
  }, [body]);

  return (
    <div className={styles.container}>
      <span className={styles.label}>Preview</span>
      <div className={styles.preview} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
