"use client";

import { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import { sanitizeHtml } from "@/lib/sanitize";
import styles from "./LivePreview.module.css";

export default function LivePreview({ data = {} }) {
  const { title, type, status, date, domain, effort, summary, technologies = [], tags = [], evidence = [], body = "" } = data;
  const [html, setHtml] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        const rendered = marked(body || "", { gfm: true, breaks: false });
        setHtml(sanitizeHtml(rendered));
      } catch {
        setHtml("<p style='color: var(--status-warn)'>Markdown parse error</p>");
      }
    }, 300);

    return () => clearTimeout(timerRef.current);
  }, [body]);

  return (
    <div className={styles.container}>
      <span className={styles.label}>Preview</span>
      <div className={styles.previewWrap}>

        {/* Title */}
        {title && <h1 className={styles.previewTitle}>{title}</h1>}
        {summary && <p className={styles.previewSummary}>{summary}</p>}

        {/* Metadata row */}
        <div className={styles.metaRow}>
          {type && <span className={styles.metaChip} data-kind="type">{type}</span>}
          {status && <span className={styles.metaChip} data-kind={status}>{status}</span>}
          {date && <span className={styles.metaMono}>{date}</span>}
          {domain && <span className={styles.metaMono}>{domain}</span>}
          {effort && <span className={styles.metaMono}>{effort}</span>}
        </div>

        {/* Technologies */}
        {technologies.length > 0 && (
          <div className={styles.tagRow}>
            <span className={styles.tagLabel}>Technologies</span>
            <div className={styles.tagList}>
              {technologies.map((t) => <span key={t} className={styles.tag}>{t}</span>)}
            </div>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className={styles.tagRow}>
            <span className={styles.tagLabel}>Tags</span>
            <div className={styles.tagList}>
              {tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}
            </div>
          </div>
        )}

        {/* Evidence preview */}
        {evidence.length > 0 && (
          <div className={styles.evidenceSection}>
            <span className={styles.evidenceLabel}>[Evidence & Attachments] {evidence.length}</span>
            {evidence.map((ev, i) => (
              <div key={ev.id || i} className={styles.evidenceCard}>
                <div className={styles.evidenceHeader}>
                  {ev.type === "terminal" && (
                    <span className={styles.termDots}>
                      <span style={{ background: "#ff5f57" }} />
                      <span style={{ background: "#febc2e" }} />
                      <span style={{ background: "#28c840" }} />
                    </span>
                  )}
                  <span className={styles.evidenceType}>{ev.type}</span>
                  <span className={styles.evidenceTitle}>{ev.title}</span>
                </div>
                {ev.content && (
                  <pre className={styles.evidencePre}>
                    <code>{ev.content.trim()}</code>
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        {(title || evidence.length > 0) && <hr className={styles.divider} />}

        {/* Body */}
        <div className={styles.preview} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
