import Link from "next/link";
import styles from "./Breadcrumb.module.css";

/**
 * Breadcrumb — reusable breadcrumb trail for nested pages.
 * Segments: array of { label, href } objects.
 * The last segment renders as plain text (current page).
 */
export default function Breadcrumb({ segments }) {
  if (!segments || segments.length === 0) return null;

  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1;
          return (
            <li key={seg.href || seg.label} className={styles.item}>
              {i > 0 && (
                <span className={styles.sep} aria-hidden="true">/</span>
              )}
              {isLast ? (
                <span className={styles.current} aria-current="page">
                  {seg.label}
                </span>
              ) : (
                <Link href={seg.href} className={styles.link}>
                  {seg.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
