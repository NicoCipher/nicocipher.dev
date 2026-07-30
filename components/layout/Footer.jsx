import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer} aria-label="Site footer">
      <div className={styles.container}>
        <div className={styles.meta}>
          <span>NICOCIPHER &copy; {new Date().getFullYear()}</span>
          <span className={styles.divider}>·</span>
          <span>Engineering Portfolio Publication System</span>
        </div>

        <div className={styles.links}>
          <a
            href="https://github.com/NicoCipher"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            github
          </a>
          <a href="mailto:nicocipherr@gmail.com" className={styles.link}>
            email
          </a>
        </div>
      </div>
    </footer>
  );
}
