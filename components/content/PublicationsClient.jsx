"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import StatusBadge from "@/components/content/StatusBadge";
import styles from "@/app/publications/page.module.css";

const VALID_TYPES = ["project", "case-study", "lab", "research"];

const FILTERS = [
  { id: "all",        label: "All"           },
  { id: "project",    label: "Projects"      },
  { id: "case-study", label: "Case Studies"  },
  { id: "lab",        label: "Labs"          },
  { id: "research",   label: "Research Notes"},
];

export default function PublicationsClient({ publications, initialType = "all" }) {
  const [selected, setSelected] = useState(initialType);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const filtered = selected === "all"
    ? publications
    : publications.filter(p => p.type === selected);

  const counts = VALID_TYPES.reduce((acc, t) => {
    acc[t] = publications.filter(p => p.type === t).length;
    return acc;
  }, {});

  function select(id) {
    setSelected(id);
    // Update URL without page reload so filter is shareable
    startTransition(() => {
      const url = id === "all" ? pathname : `${pathname}?type=${id}`;
      router.replace(url, { scroll: false });
    });
  }

  return (
    <>
      {/* Type Filters — instant client-side switch */}
      <nav className={styles.filters} aria-label="Filter publications by type">
        {FILTERS.map(f => {
          const count = f.id === "all" ? publications.length : (counts[f.id] ?? 0);
          const isActive = selected === f.id;
          return (
            <button
              key={f.id}
              onClick={() => select(f.id)}
              className={`${styles.filterBtn} ${isActive ? styles.filterActive : ""}`}
              aria-pressed={isActive}
            >
              {f.label}
              <span className={styles.filterCount}>{count}</span>
            </button>
          );
        })}
      </nav>

      {/* Publication List */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span>No publications in this category yet.</span>
        </div>
      ) : (
        <div
          className={styles.list}
          style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 120ms" }}
        >
          {filtered.map(pub => {
            const firstTerminal = pub.evidence?.find(e => e.type === "terminal");
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
                  <span className={styles.recruiterBadge}>Recruiter Briefing</span>
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
                      {pub.tags.map(tag => (
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
    </>
  );
}
