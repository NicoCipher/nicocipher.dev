import Link from "next/link";
import profile from "@/data/profile.json";
import domains from "@/data/domains.json";
import { getAllPublications } from "@/lib/publications";
import styles from "./page.module.css";

export const metadata = {
  title: "About & Engineering Methodology",
  description:
    "Engineering background, methodology, domains of practice, and system colophon for NicoCipher.",
};

export default function AboutPage() {
  const pubs = getAllPublications();
  const totalPubs = pubs.length;
  const totalTechnologies = domains.reduce((acc, d) => acc + d.technologies.length, 0);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>About & Methodology</h1>
        <p className={styles.subtitle}>{profile.role}</p>
      </header>

      {/* Statement */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true">[</span> Statement <span aria-hidden="true">]</span>
        </h2>
        <p className={styles.text}>{profile.bio}</p>
      </section>

      {/* Engineering Methodology */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true">[</span> Engineering Methodology <span aria-hidden="true">]</span>
        </h2>
        <div className={styles.principleGrid}>
          <div className={styles.principleCard}>
            <h3 className={styles.principleTitle}>Learn by Building</h3>
            <p className={styles.principleText}>
              Theory is verified through practical implementation in isolated environments.
              Labs, disposable VMs, and controlled experiments produce direct evidence.
            </p>
          </div>
          <div className={styles.principleCard}>
            <h3 className={styles.principleTitle}>Evidence Over Assertion</h3>
            <p className={styles.principleText}>
              Claims are substantiated with terminal outputs, packet captures, diffs,
              architecture diagrams, and reproducible procedures.
            </p>
          </div>
          <div className={styles.principleCard}>
            <h3 className={styles.principleTitle}>Document the Failures</h3>
            <p className={styles.principleText}>
              Every publication includes a "What Went Wrong" section. Honest documentation
              of failures is more credible than polished success stories.
            </p>
          </div>
          <div className={styles.principleCard}>
            <h3 className={styles.principleTitle}>Structured Publishing</h3>
            <p className={styles.principleText}>
              All work is published through a consistent schema — objective, implementation,
              friction points, resolution, and takeaways. Format is the discipline.
            </p>
          </div>
        </div>
      </section>

      {/* Domains of Practice */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true">[</span> Domains of Practice <span aria-hidden="true">]</span>
        </h2>
        <div className={styles.domainList}>
          {domains.map((domain) => (
            <div key={domain.id} className={styles.domainRow}>
              <span className={styles.domainName}>{domain.label}</span>
              <span className={styles.domainTechs}>
                {domain.technologies.map((t) => t.name).join(" · ")}
              </span>
            </div>
          ))}
        </div>
        <Link href="/systems" className={styles.systemsLink}>
          View Full Technology Map ({totalTechnologies} technologies) →
        </Link>
      </section>

      {/* Contact */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true">[</span> Contact <span aria-hidden="true">]</span>
        </h2>
        <div className={styles.contactGrid}>
          <div className={styles.contactItem}>
            <span className={styles.contactLabel}>Email</span>
            <a href={`mailto:${profile.email}`} className={styles.contactValue}>
              {profile.email}
            </a>
          </div>
          {profile.github && (
            <div className={styles.contactItem}>
              <span className={styles.contactLabel}>GitHub</span>
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactValue}
              >
                {profile.github.replace("https://github.com/", "github.com/")}
              </a>
            </div>
          )}
          {profile.linkedin && (
            <div className={styles.contactItem}>
              <span className={styles.contactLabel}>LinkedIn</span>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactValue}
              >
                {profile.linkedin.replace("https://", "")}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* System Colophon */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true">[</span> System Colophon <span aria-hidden="true">]</span>
        </h2>
        <div className={styles.colophonGrid}>
          <div className={styles.colophonItem}>
            <span className={styles.colophonLabel}>Framework</span>
            <span className={styles.colophonValue}>Next.js 15 (App Router)</span>
          </div>
          <div className={styles.colophonItem}>
            <span className={styles.colophonLabel}>Rendering</span>
            <span className={styles.colophonValue}>100% Static (SSG)</span>
          </div>
          <div className={styles.colophonItem}>
            <span className={styles.colophonLabel}>Styling</span>
            <span className={styles.colophonValue}>CSS Modules + Custom Properties</span>
          </div>
          <div className={styles.colophonItem}>
            <span className={styles.colophonLabel}>Fonts</span>
            <span className={styles.colophonValue}>Instrument Sans · Source Serif 4 · JetBrains Mono</span>
          </div>
          <div className={styles.colophonItem}>
            <span className={styles.colophonLabel}>Dependencies</span>
            <span className={styles.colophonValue}>5 total (next, react, react-dom, gray-matter, marked)</span>
          </div>
          <div className={styles.colophonItem}>
            <span className={styles.colophonLabel}>Publications</span>
            <span className={styles.colophonValue}>{totalPubs} published across {domains.length} domains</span>
          </div>
        </div>
      </section>
    </div>
  );
}
