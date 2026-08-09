import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.container}>
      <span className={styles.code} aria-hidden="true">404</span>
      <h1 className={styles.heading}>Page not found</h1>
      <p className={styles.message}>
        The requested path does not match any publication or page in this system.
      </p>
      <div className={styles.actions}>
        <Link href="/" className={styles.link}>
          ← Home
        </Link>
        <Link href="/publications" className={styles.link}>
          Publications Index
        </Link>
      </div>
    </div>
  );
}
