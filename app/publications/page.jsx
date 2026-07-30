import Link from "next/link";
import { getAllPublications } from "@/lib/publications";
import styles from "./page.module.css";

export const metadata = {
  title: "Publications Index",
  description: "Master index of engineering projects, case studies, labs, and research notes.",
};

export default function PublicationsIndexPage({ searchParams }) {
  const allPubs = getAllPublications();
  const selectedType = searchParams?.type || "all";

  const filtered = selectedType === "all"
    ? allPubs
    : allPubs.filter((p) => p.type === selectedType);

  const types = [
    { id: "all", label: "All Publications", count: allPubs.length },
    { id: "project", label: "Projects", count: allPubs.filter((p) => p.type === "project").length },
    { id: "case-study", label: "Case Studies", count: allPubs.filter((p) => p.type === "case-study").length },
    { id: "lab", label: "Labs", count: allPubs.filter((p) => p.type === "lab").length },
    { id: "research", label: "Research Notes", count: allPubs.filter((p) => p.type === "research").length },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Publications Master Index</h1>
        <p className={styles.subtitle}>
          Structured, evidence-backed documentation of engineering work, technical investigations, labs, and security research.
        </p>
      </header>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        {types.map((t) => (
          <Link
            key={t.id}
            href={t.id === "all" ? "/publications" : `/publications?type=${t.id}`}
            className={`${styles.filterItem} ${selectedType === t.id ? styles.activeFilter : ""}`}
          >
            {t.label} <span className={styles.filterCount}>({t.count})</span>
          </Link>
        ))}
      </div>

      {/* Publication List */}
      <div className={styles.list}>
        {filtered.map((pub) => (
          <Link
            key={pub.type + pub.slug}
            href={`/publications/${pub.type}/${pub.slug}`}
            className={styles.pubRow}
          >
            <div className={styles.pubMeta}>
              <span className={styles.typeBadge}>{pub.type}</span>
              <span className={styles.pubDate}>{pub.date}</span>
              {pub.effort && <span className={styles.pubEffort}>· {pub.effort}</span>}
            </div>
            <div className={styles.pubMain}>
              <h2 className={styles.pubTitle}>{pub.title}</h2>
              <p className={styles.pubSummary}>{pub.summary}</p>
              <div className={styles.tags}>
                {pub.tags?.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
