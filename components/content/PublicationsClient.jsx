"use client";

import { useState, useTransition, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import StatusBadge from "@/components/content/StatusBadge";
import styles from "@/app/publications/page.module.css";

const VALID_TYPES = ["project", "case-study", "lab", "research"];

const FILTERS = [
  { id: "all",        label: "All Work"      },
  { id: "project",    label: "Projects"      },
  { id: "case-study", label: "Case Studies"  },
  { id: "lab",        label: "Labs"          },
  { id: "research",   label: "Research Notes"},
];

export default function PublicationsClient({ publications, initialType = "all" }) {
  const [selected, setSelected] = useState(initialType);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const searchInputRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // Filter by category and search query
  const filtered = useMemo(() => {
    return publications.filter((p) => {
      const matchesType = selected === "all" || p.type === selected;
      if (!matchesType) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      const inTitle = p.title?.toLowerCase().includes(q);
      const inSummary = p.summary?.toLowerCase().includes(q);
      const inTags = p.tags?.some((t) => t.toLowerCase().includes(q));
      const inTech = p.technologies?.some((t) => t.toLowerCase().includes(q));
      const inDomain = p.domain?.toLowerCase().includes(q);

      return inTitle || inSummary || inTags || inTech || inDomain;
    });
  }, [publications, selected, searchQuery]);

  const counts = useMemo(() => {
    return VALID_TYPES.reduce((acc, t) => {
      acc[t] = publications.filter((p) => p.type === t).length;
      return acc;
    }, {});
  }, [publications]);

  function select(id) {
    setSelected(id);
    startTransition(() => {
      const url = id === "all" ? pathname : `${pathname}?type=${id}`;
      router.replace(url, { scroll: false });
    });
  }

  function resetFilters() {
    setSelected("all");
    setSearchQuery("");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
    searchInputRef.current?.focus();
  }

  const isFiltered = selected !== "all" || searchQuery.trim() !== "";

  return (
    <div className={styles.wrapper}>
      {/* Controls Bar: Search & Type Filter Toolbar */}
      <div className={styles.controlsBar}>
        {/* Search Input */}
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon} aria-hidden="true">⌕</span>
          <label htmlFor="pub-search-input" className="visually-hidden">
            Search publications by keyword, tag, or technology
          </label>
          <input
            ref={searchInputRef}
            id="pub-search-input"
            type="search"
            className={styles.searchInput}
            placeholder="Filter by keyword, protocol, tool..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearchQuery("");
              }
            }}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => {
                setSearchQuery("");
                searchInputRef.current?.focus();
              }}
              aria-label="Clear keyword filter"
            >
              ×
            </button>
          )}
        </div>

        {/* Type Filter Buttons */}
        <div className={styles.filters} role="toolbar" aria-label="Filter publications by type">
          {FILTERS.map((f) => {
            const count = f.id === "all" ? publications.length : (counts[f.id] ?? 0);
            const isActive = selected === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => select(f.id)}
                className={`${styles.filterBtn} ${isActive ? styles.filterActive : ""}`}
                aria-pressed={isActive}
              >
                <span>{f.label}</span>
                <span className={styles.filterCount} aria-hidden="true">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Screen Reader Live Results Announcer */}
      <div className="visually-hidden" aria-live="polite" aria-atomic="true">
        Showing {filtered.length} publication{filtered.length === 1 ? "" : "s"}
        {selected !== "all" ? ` for ${selected}` : ""}
        {searchQuery ? ` matching "${searchQuery}"` : ""}.
      </div>

      {/* Active Filter Summary Bar when filtered */}
      {isFiltered && (
        <div className={styles.activeFilterBar}>
          <span className={styles.resultCountText}>
            Showing <strong>{filtered.length}</strong> of {publications.length} publications
          </span>
          <button
            type="button"
            className={styles.resetLink}
            onClick={resetFilters}
          >
            Reset all filters
          </button>
        </div>
      )}

      {/* Publication List or Empty Recovery State */}
      {filtered.length === 0 ? (
        <div className={styles.emptyCard} role="status">
          <div className={styles.emptyIcon} aria-hidden="true">∅</div>
          <h2 className={styles.emptyTitle}>No matching publications found</h2>
          <p className={styles.emptyMessage}>
            No publications matched your current filter criteria
            {searchQuery ? ` ("${searchQuery}")` : ""}
            {selected !== "all" ? ` in category "${selected}"` : ""}.
          </p>
          <div className={styles.emptyActions}>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={resetFilters}
            >
              Reset all filters
            </button>
          </div>
        </div>
      ) : (
        <div
          className={styles.list}
          style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 120ms" }}
        >
          {filtered.map((pub) => {
            const firstTerminal = pub.evidence?.find((e) => e.type === "terminal");
            const preview = firstTerminal?.content?.split("\n").slice(0, 2).join("\n");

            return (
              <Link
                key={pub.type + pub.slug}
                href={`/publications/${pub.type}/${pub.slug}`}
                className={styles.pubRow}
              >
                <div className={styles.pubMeta}>
                  <span className={styles.pubType}>{pub.type}</span>
                  <StatusBadge status={pub.status} />
                  <time dateTime={pub.date} className={styles.pubDate}>{pub.date}</time>
                  {pub.effort && <span className={styles.pubEffort}>· {pub.effort}</span>}
                  {pub.evidence?.length > 0 && (
                    <span className={styles.pubEvidenceCount}>
                      {pub.evidence.length} evidence item{pub.evidence.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className={styles.pubMain}>
                  <h2 className={styles.pubTitle}>{pub.title}</h2>
                  <p className={styles.pubSummary}>{pub.summary}</p>
                  {preview?.trim() && (
                    <div className={styles.evidencePreview} aria-hidden="true">
                      <span className={styles.evidencePreviewDot} />
                      <code className={styles.evidencePreviewCode}>{preview}</code>
                    </div>
                  )}
                  {pub.tags?.length > 0 && (
                    <div className={styles.pubTags} aria-label="Tags">
                      {pub.tags.map((tag) => (
                        <span key={tag} className={styles.pubTag}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
