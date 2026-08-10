import Link from "next/link";
import { getAllPublications } from "@/lib/publications";
import StatusBadge from "@/components/content/StatusBadge";
import styles from "./page.module.css";

export const metadata = {
  title: "Publications — NICOCIPHER",
  description:
    "Master index of engineering projects, case studies, labs, and research notes. Evidence-backed technical publications.",
};

const VALID_TYPES = ["project", "case-study", "lab", "research"];

export default async function PublicationsIndexPage({ searchParams }) {
  const params = await searchParams;
  const selectedType = VALID_TYPES.includes(params?.type) ? params.type : "all";

  const allPubs = getAllPublications();

  const filtered =
    selectedType === "all"
      ? allPubs
      : allPubs.filter((p) => p.type === selectedType);

  const typeCounts = VALID_TYPES.reduce((acc, t) => {
    acc[t] = allPubs.filter((p) => p.type === t).length;
    return acc;
  }, {});

  const filters = [
    { id: "all", label: "All", count: allPubs.length },
    { id: "project", label: "Projects", count: typeCounts["project"] },
    { id: "case-study", label: "Case Studies", count: typeCounts["case-study"] },
    { id: "lab", label: "Labs", count: typeCounts["lab"] },
    { id: "research", label: "Research Notes", count: typeCounts["research"] },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Publications</h1>
        <p className={styles.subtitle}>
          Structured, evidence-backed documentation across infrastructure, cybersecurity,
          networking, and software engineering.
        </p>
      </header>

      {/* Type Filter — server-rendered Links, no JS required */}
      <nav className={styles.filters} aria-label="Filter publications by type">
        {filters.map((f) => {
          const isActive = selectedType === f.id;
          return (
            <Link
              key={f.id}
              href={f.id === "all" ? "/publications" : `/publications?type=${f.id}`}
              className={`${styles.filterBtn} ${isActive ? styles.filterActive : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              {f.label}
              <span className={styles.filterCount}>{f.count}</span>
            </Link>
          );
        })}
      </nav>

      {/* Publication List */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span>No publications in this category yet.</span>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((pub) => (
            <Link
              key={pub.type + pub.slug}
              href={`/publications/${pub.type}/${pub.slug}`}
              className={styles.pubRow}
            >
              <div className={styles.pubMeta}>
                <span className={styles.pubType}>{pub.type}</span>
                <StatusBadge status={pub.status} />
                <time dateTime={pub.date} className={styles.pubDate}>
                  {pub.date}
                </time>
                {pub.effort && (
                  <span className={styles.pubEffort}>· {pub.effort}</span>
                )}
              </div>
              <div className={styles.pubMain}>
                <h2 className={styles.pubTitle}>{pub.title}</h2>
                <p className={styles.pubSummary}>{pub.summary}</p>
                {pub.tags?.length > 0 && (
                  <div className={styles.pubTags} aria-label="Tags">
                    {pub.tags.map((tag) => (
                      <span key={tag} className={styles.pubTag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
