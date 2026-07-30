"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./CommandPalette.module.css";

export default function CommandPalette({ searchIndex = [], onClose }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = query.trim() === ""
    ? searchIndex.slice(0, 8)
    : searchIndex.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.title?.toLowerCase().includes(q) ||
          item.type?.toLowerCase().includes(q) ||
          item.tags?.some((t) => t.toLowerCase().includes(q)) ||
          item.excerpt?.toLowerCase().includes(q)
        );
      }).slice(0, 10);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      router.push(filtered[selectedIndex].url);
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
      >
        <div className={styles.inputWrapper}>
          <span className={styles.prompt}>/</span>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Search publications, topics, technologies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            esc
          </button>
        </div>

        <div className={styles.results}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>No matching publications found.</div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={item.url + idx}
                className={`${styles.resultItem} ${
                  idx === selectedIndex ? styles.selected : ""
                }`}
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => {
                  router.push(item.url);
                  onClose();
                }}
              >
                <div className={styles.resultMeta}>
                  <span className={styles.typeBadge}>{item.type}</span>
                  <span className={styles.resultTitle}>{item.title}</span>
                </div>
                {item.excerpt && (
                  <p className={styles.resultExcerpt}>{item.excerpt}</p>
                )}
              </div>
            ))
          )}
        </div>

        <div className={styles.footer}>
          <span><kbd className={styles.kbd}>↑↓</kbd> navigate</span>
          <span><kbd className={styles.kbd}>↵</kbd> select</span>
          <span><kbd className={styles.kbd}>esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
