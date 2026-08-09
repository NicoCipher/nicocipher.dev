import Link from "next/link";
import StatusBadge from "@/components/content/StatusBadge";
import styles from "./FeaturedPublications.module.css";

export default function FeaturedPublications({ publications, totalCount }) {
  if (!publications || publications.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Featured publications">
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true">[</span> Featured Publications <span aria-hidden="true">]</span>
        </h2>
        <Link href="/publications" className={styles.viewAll}>
          View All ({totalCount}) →
        </Link>
      </div>

      <div className={styles.list}>
        {publications.map((pub) => (
          <Link
            key={pub.type + pub.slug}
            href={`/publications/${pub.type}/${pub.slug}`}
            className={styles.row}
          >
            <div className={styles.rowMeta}>
              <span className={styles.typeBadge}>{pub.type}</span>
              <StatusBadge status={pub.status} />
              <time dateTime={pub.date} className={styles.date}>
                {pub.date}
              </time>
            </div>
            <div className={styles.rowContent}>
              <h3 className={styles.title}>{pub.title}</h3>
              <p className={styles.summary}>{pub.summary}</p>
            </div>
            {pub.tags?.length > 0 && (
              <div className={styles.tags}>
                {pub.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
