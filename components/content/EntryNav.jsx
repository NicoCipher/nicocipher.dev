import Link from "next/link";
import styles from "./EntryNav.module.css";

/**
 * EntryNav — Previous / Next navigation between publications.
 * Receives adjacent publications sorted by date.
 */
export default function EntryNav({ prev, next }) {
  if (!prev && !next) return null;

  return (
    <nav
      className={styles.nav}
      aria-label="Publication navigation"
    >
      <div className={styles.side}>
        {prev && (
          <Link href={`/publications/${prev.type}/${prev.slug}`} className={styles.link}>
            <span className={styles.direction} aria-hidden="true">←</span>
            <span className={styles.linkContent}>
              <span className={styles.directionLabel}>Previous</span>
              <span className={styles.title}>{prev.title}</span>
              <span className={styles.meta}>{prev.type} · {prev.date}</span>
            </span>
          </Link>
        )}
      </div>

      <div className={`${styles.side} ${styles.right}`}>
        {next && (
          <Link href={`/publications/${next.type}/${next.slug}`} className={styles.link}>
            <span className={styles.linkContent}>
              <span className={styles.directionLabel}>Next</span>
              <span className={styles.title}>{next.title}</span>
              <span className={styles.meta}>{next.type} · {next.date}</span>
            </span>
            <span className={styles.direction} aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
