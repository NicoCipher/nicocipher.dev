import { GitHubIcon, LinkedInIcon } from "@/components/ui/Icons";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer} aria-label="Site footer">
      <div className={styles.footerInner}>
        <div className={styles.copyright}>
          <span>NICOCIPHER &copy; {new Date().getFullYear()}</span>
          <span className={styles.divider}>·</span>
          <span>Systems &amp; Security Engineering</span>
        </div>

        <div className={styles.links}>
          <a
            href="https://github.com/NicoCipher"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            aria-label="GitHub Profile"
          >
            <GitHubIcon size={14} />
            <span>GitHub</span>
          </a>
          <a
            href="https://linkedin.com/in/nicocipher"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            aria-label="LinkedIn Profile"
          >
            <LinkedInIcon size={14} />
            <span>LinkedIn</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
