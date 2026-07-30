import domains from "@/data/domains.json";
import { getAllPublications } from "@/lib/publications";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata = {
  title: "Technology & Systems Taxonomy Map",
  description: "Map of engineering domains, technologies, and cross-linked publications.",
};

export default function SystemsPage() {
  const publications = getAllPublications();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Technology & Systems Map</h1>
        <p className={styles.subtitle}>
          Taxonomy of engineering domains, tools, and technical contexts cross-linked to verified publications.
        </p>
      </header>

      <div className={styles.domainGrid}>
        {domains.map((domain) => {
          const domainPubs = publications.filter(
            (p) => p.domain === domain.id || p.tags?.some((t) => t.toLowerCase() === domain.id)
          );

          return (
            <div key={domain.id} className={styles.domainCard}>
              <div className={styles.domainHeader}>
                <h2 className={styles.domainTitle}>{domain.label}</h2>
                <span className={styles.pubCount}>
                  {domainPubs.length} publication{domainPubs.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className={styles.techList}>
                {domain.technologies.map((tech) => (
                  <div key={tech.name} className={styles.techItem}>
                    <span className={styles.techName}>{tech.name}</span>
                    <span className={styles.techContext}>{tech.context}</span>
                  </div>
                ))}
              </div>

              {domainPubs.length > 0 && (
                <div className={styles.linkedPubs}>
                  <span className={styles.linkedLabel}>Linked Publications:</span>
                  <div className={styles.pubLinks}>
                    {domainPubs.map((pub) => (
                      <Link
                        key={pub.type + pub.slug}
                        href={`/publications/${pub.type}/${pub.slug}`}
                        className={styles.pubLink}
                      >
                        {pub.title} ({pub.type})
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
