"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { searchIndex } from "@/lib/searchClient";
import styles from "./CommandPalette.module.css";

// ─── Highlight matched substring ───────────────────────────────────────────

function Highlight({ text, query }) {
  if (!query || !text) return <span>{text}</span>;

  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;

  return (
    <span>
      {text.slice(0, idx)}
      <mark className={styles.mark}>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </span>
  );
}

// ─── Group results by kind ─────────────────────────────────────────────────

function groupResults(results) {
  const groups = {};
  const ORDER = ["publication", "type-filter", "page"];

  for (const item of results) {
    if (!groups[item.kind]) groups[item.kind] = [];
    groups[item.kind].push(item);
  }

  return ORDER.filter((k) => groups[k]).map((k) => ({
    kind: k,
    label:
      k === "publication" ? "Publications" :
      k === "type-filter" ? "Browse by Type" :
      "Pages",
    items: groups[k],
  }));
}

const KIND_LABELS = {
  "publication": "Publications",
  "type-filter": "Browse by Type",
  "page": "Pages",
};

// ─── CommandPalette ────────────────────────────────────────────────────────

export default function CommandPalette({ searchIndex: index = [], onClose }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const selectedRef = useRef(null);
  const router = useRouter();

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Compute results
  const { results, query: normalizedQuery } = searchIndex(index, query);
  const groups = groupResults(results);

  // Flat list for keyboard navigation
  const flat = results;

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const navigate = useCallback(
    (item) => {
      router.push(item.url);
      onClose();
    },
    [router, onClose]
  );

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "Escape":
        onClose();
        break;
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < flat.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flat.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (flat[selectedIndex]) navigate(flat[selectedIndex]);
        break;
      case "Tab":
        // Tab cycles forward through results without leaving input
        e.preventDefault();
        setSelectedIndex((prev) => (prev < flat.length - 1 ? prev + 1 : 0));
        break;
    }
  };

  // Build a flat index counter across groups for selection mapping
  let flatIdx = 0;

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        {/* Input */}
        <div className={styles.inputWrapper}>
          <span className={styles.prompt} aria-hidden="true">/</span>
          <input
            ref={inputRef}
            id="palette-input"
            type="text"
            className={styles.input}
            placeholder="Search publications, topics, technologies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search"
            aria-autocomplete="list"
            aria-controls="palette-results"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close palette"
          >
            esc
          </button>
        </div>

        {/* Results */}
        <div
          id="palette-results"
          className={styles.results}
          role="listbox"
          aria-label="Search results"
        >
          {flat.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon} aria-hidden="true">∅</span>
              <span>No results for <strong>{query}</strong></span>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.kind} className={styles.group}>
                <div className={styles.groupLabel} aria-hidden="true">
                  {group.label}
                  <span className={styles.groupCount}>{group.items.length}</span>
                </div>

                {group.items.map((item) => {
                  const thisIdx = flatIdx++;
                  const isSelected = thisIdx === selectedIndex;

                  return (
                    <div
                      key={item.id}
                      ref={isSelected ? selectedRef : null}
                      className={`${styles.resultItem} ${isSelected ? styles.selected : ""}`}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setSelectedIndex(thisIdx)}
                      onClick={() => navigate(item)}
                    >
                      <div className={styles.resultMeta}>
                        <span className={`${styles.typeBadge} ${styles[`kind_${item.kind}`]}`}>
                          {item.typeLabel}
                        </span>
                        <span className={styles.resultTitle}>
                          <Highlight text={item.title} query={normalizedQuery} />
                        </span>
                        {item.readingTime && (
                          <span className={styles.readingTime}>{item.readingTime}</span>
                        )}
                      </div>
                      {item.excerpt && (
                        <p className={styles.resultExcerpt}>
                          <Highlight text={item.excerpt} query={normalizedQuery} />
                        </p>
                      )}
                      {item.technologies?.length > 0 && normalizedQuery &&
                        item.technologies.some((t) => t.toLowerCase().includes(normalizedQuery)) && (
                        <div className={styles.matchedTags}>
                          {item.technologies
                            .filter((t) => t.toLowerCase().includes(normalizedQuery))
                            .slice(0, 3)
                            .map((t) => (
                              <span key={t} className={styles.matchedTag}>{t}</span>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <span className={styles.footerHint}>
            <kbd className={styles.kbd}>↑↓</kbd> navigate
          </span>
          <span className={styles.footerHint}>
            <kbd className={styles.kbd}>↵</kbd> open
          </span>
          <span className={styles.footerHint}>
            <kbd className={styles.kbd}>tab</kbd> cycle
          </span>
          <span className={styles.footerHint}>
            <kbd className={styles.kbd}>esc</kbd> close
          </span>
          {flat.length > 0 && (
            <span className={styles.resultCount}>
              {flat.length} result{flat.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
