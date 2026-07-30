import profile from "@/data/profile.json";
import styles from "./page.module.css";

export const metadata = {
  title: "About & Engineering Methodology",
  description: "Background, technical approach, and colophon for NicoCipher.",
};

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>About & Methodology</h1>
        <p className={styles.subtitle}>{profile.role}</p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>[ Statement ]</h2>
        <p className={styles.text}>{profile.bio}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>[ Engineering Methodology ]</h2>
        <ul className={styles.list}>
          <li>
            <strong>Learn by Building & Testing:</strong> Theory is verified in disposable environments before drawing production conclusions.
          </li>
          <li>
            <strong>Evidence Over Assertion:</strong> Claims are backed by log outputs, packet captures, diffs, and reproducible labs.
          </li>
          <li>
            <strong>Documentation as Craft:</strong> Architecture decisions, failure modes, and permanent takeaways are recorded systematically.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>[ System Colophon ]</h2>
        <p className={styles.text}>
          This portfolio publication system is built with Next.js 15 (App Router, React 19) and zero Tailwind. Styling is authored with CSS Custom Properties tokens and scoped CSS Modules. Publications are parsed statically at build time from structured Markdown and YAML frontmatter.
        </p>
      </section>
    </div>
  );
}
