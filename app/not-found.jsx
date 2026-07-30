import Link from "next/link";
import styles from "./page.module.css";

export default function NotFound() {
  return (
    <div className={styles.container} style={{ textAlign: "center", paddingTop: "12vh" }}>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
        404 — NOT FOUND
      </p>
      <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-xl)", margin: "var(--space-2) 0" }}>
        No publication entry at this location.
      </h1>
      <Link href="/publications" style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--accent)" }}>
        &larr; Back to Publications Master Index
      </Link>
    </div>
  );
}
