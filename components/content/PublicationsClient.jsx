"use client";

import { useState, useTransition, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import StatusBadge from "@/components/content/StatusBadge";
import styles from "@/app/publications/page.module.css";

const VALID_TYPES = ["project", "case-study", "lab", "research"];

const TYPE_FILTERS = [
  { id: "all",        label: "All Work"      },
  { id: "project",    label: "Projects"      },
  { id: "case-study", label: "Case Studies"  },
  { id: "lab",        label: "Labs"          },
  { id: "research",   label: "Research Notes"},
];

const DOMAIN_FILTERS = [
  { id: "all",            label: "All Domains"    },
  { id: "networking",     label: "Networking"     },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "security",       label: "Cybersecurity"  },
  { id: "development",    label: "Development"    },
];

export default function PublicationsClient({
  publications,
  initialType = "all",
  initialDomain = "all",
}) {
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedDomain, setSelectedDomain] = useState(initialDomain);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const searchInputRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // Filter by category, engineering domain, and search query
  const filtered = useMemo(() => {
    return publications.filter((p) => {
      const matchesType = selectedType === "all" || p.type === selectedType;
      if (!matchesType) return false;

      const matchesDomain =
        selectedDomain === "all" || p.domain?.toLowerCase() === selectedDomain;
      if (!matchesDomain) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      const inTitle = p.title?.toLowerCase().includes(q);
      const inSummary = p.summary?.toLowerCase().includes(q);
      const inTags = p.tags?.some((t) => t.toLowerCase().includes(q));
      const inTech = p.technologies?.some((t) => t.toLowerCase().includes(q));
      const inDomain = p.domain?.toLowerCase().includes(q);

      return inTitle || inSummary || inTags || inTech || inDomain;
    });
  }, [publications, selectedType, selectedDomain, searchQuery]);

  const typeCounts = useMemo(() => {
    return TYPE_FILTERS.reduce((acc, f) => {
      if (f.id === "all") {
        acc[f.id] = publications.length;
      } else {
        acc[f.id] = publications.filter((p) => p.type === f.id).length;
      }
      return acc;
    }, {});
  }, [publications]);

  const domainCounts = useMemo(() => {
    return DOMAIN_FILTERS.reduce((acc, f) => {
      if (f.id === "all") {
        acc[f.id] = publications.length;
      } else {
        acc[f.id] = publications.filter((p) => p.domain?.toLowerCase() === f.id).length;
      }
      return acc;
    }, {});
  }, [publications]);

  function updateUrl(newType, newDomain) {
    startTransition(() => {
      const params = new URLSearchParams();
      if (newType !== "all") params.set("type", newType);
      if (newDomain !== "all") params.set("domain", newDomain);
      const qs = params.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      router.replace(url, { scroll: false });
    });
  }

  function selectType(id) {
    setSelectedType(id);
    updateUrl(id, selectedDomain);
  }

  function selectDomain(id) {
    setSelectedDomain(id);
    updateUrl(selectedType, id);
  }

  function resetFilters() {
    setSelectedType("all");
    setSelectedDomain("all");
    setSearchQuery("");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
    searchInputRef.current?.focus();
  }

  const isFiltered =
    selectedType !== "all" || selectedDomain !== "all" || searchQuery.trim() !== "";

  return (
    <div className={styles.wrapper}>
      {/* Controls Bar: Search & Dual Filter Toolbar */}
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
        <div className={styles.filterGroup}>
          <span className={styles.filterGroupLabel}>Format</span>
          <div className={styles.filters} role="toolbar" aria-label="Filter publications by format">
            {TYPE_FILTERS.map((f) => {
              const count = typeCounts[f.id] ?? 0;
              const isActive = selectedType === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => selectType(f.id)}
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

        {/* Domain Filter Buttons */}
        <div className={styles.filterGroup}>
          <span className={styles.filterGroupLabel}>Engineering Domain</span>
          <div className={styles.filters} role="toolbar" aria-label="Filter publications by domain">
            {DOMAIN_FILTERS.map((f) => {
              const count = domainCounts[f.id] ?? 0;
              const isActive = selectedDomain === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => selectDomain(f.id)}
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
      </div>

      {/* Screen Reader Live Results Announcer */}
      <div className="visually-hidden" aria-live="polite" aria-atomic="true">
        Showing {filtered.length} publication{filtered.length === 1 ? "" : "s"}
        {selectedType !== "all" ? ` for format ${selectedType}` : ""}
        {selectedDomain !== "all" ? ` in domain ${selectedDomain}` : ""}
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
            {selectedType !== "all" ? ` in format "${selectedType}"` : ""}
            {selectedDomain !== "all" ? ` in domain "${selectedDomain}"` : ""}.
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
