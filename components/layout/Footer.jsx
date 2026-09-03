import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer} aria-label="Site footer">
      <div className={styles.footerInner}>
        <div className={styles.copyright}>
          <span>NICOCIPHER &copy; {new Date().getFullYear()}</span>
          <span className={styles.divider}>·</span>
          <span>Engineering Portfolio Publication System</span>
        </div>

        <div className={styles.links}>
          <a href="/feed.xml" className={styles.link} aria-label="RSS Feed">
            rss
          </a>
          <a href="/sitemap.xml" className={styles.link}>
            sitemap
          </a>
          <a
            href="https://github.com/NicoCipher"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            github
          </a>
          <a
            href="https://linkedin.com/in/nicocipher"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            linkedin
          </a>
          <a href="mailto:nicocipherr@gmail.com" className={styles.link}>
            email
          </a>
        </div>
      </div>
    </footer>
  );
}
