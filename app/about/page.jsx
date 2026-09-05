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

      {/* Career Positioning & Target Roles */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true">[</span> Career Focus &amp; Target Roles <span aria-hidden="true">]</span>
        </h2>
        <div className={styles.targetCard}>
          <div className={styles.targetItem}>
            <span className={styles.targetLabel}>Target Roles:</span>
            <div className={styles.roleBadges}>
              {profile.targetRoles?.map((r) => (
                <span key={r} className={styles.roleBadge}>{r}</span>
              ))}
            </div>
          </div>
          <div className={styles.targetItem}>
            <span className={styles.targetLabel}>Location &amp; Availability:</span>
            <span className={styles.targetValue}>{profile.location}</span>
          </div>
        </div>
      </section>

      {/* Education & Certifications */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true">[</span> Education &amp; Certifications <span aria-hidden="true">]</span>
        </h2>
        <div className={styles.certGrid}>
          <div className={styles.certCard}>
            <span className={styles.certStatus}>In Progress</span>
            <h3 className={styles.certTitle}>Google Cybersecurity Professional Certificate</h3>
            <p className={styles.certDetail}>
              Comprehensive credential covering network security architecture, Linux command-line defense, SIEM analysis, Python automation, and risk mitigation.
            </p>
          </div>
          <div className={styles.certCard}>
            <span className={styles.certStatus}>Active Study</span>
            <h3 className={styles.certTitle}>Cisco Certified Network Associate (CCNA)</h3>
            <p className={styles.certDetail}>
              Hands-on enterprise curriculum focusing on 3-tier switching, OSPF dynamic routing, 802.1Q VLAN trunking, and IP subnetting.
            </p>
          </div>
        </div>
      </section>

      {/* Engineering Methodology */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true">[</span> Engineering Methodology <span aria-hidden="true">]</span>
        </h2>
        <div className={styles.principleGrid}>
          <Link href="/publications/lab/domain-controller" className={styles.principleCard}>
            <h3 className={styles.principleTitle}>Learn by Building</h3>
            <p className={styles.principleText}>
              Theory is verified through practical implementation in isolated environments.
              Labs, disposable VMs, and controlled experiments produce direct evidence.
            </p>
            <span className={styles.principleLink}>See: Domain Controller Lab →</span>
          </Link>
          <Link href="/publications/case-study/linux-permissions" className={styles.principleCard}>
            <h3 className={styles.principleTitle}>Evidence Over Assertion</h3>
            <p className={styles.principleText}>
              Claims are substantiated with terminal outputs, packet captures, diffs,
              architecture diagrams, and reproducible procedures.
            </p>
            <span className={styles.principleLink}>See: chmod Case Study →</span>
          </Link>
          <Link href="/publications/lab/ubuntu-active-directory-integration" className={styles.principleCard}>
            <h3 className={styles.principleTitle}>Document the Failures</h3>
            <p className={styles.principleText}>
              Every publication includes a "What Went Wrong" section. Honest documentation
              of failures is more credible than polished success stories.
            </p>
            <span className={styles.principleLink}>See: Ubuntu AD Integration Lab →</span>
          </Link>
          <Link href="/publications/project/nicocipher-portfolio" className={styles.principleCard}>
            <h3 className={styles.principleTitle}>Structured Publishing</h3>
            <p className={styles.principleText}>
              All work is published through a consistent schema — what I built,
              what broke, how it was fixed, and what I learned. Format is the discipline.
            </p>
            <span className={styles.principleLink}>See: This Portfolio →</span>
          </Link>
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
            <span className={styles.colophonValue}>8 configurable pairings (Instrument Sans, Geist, Inter, IBM Plex, and more)</span>
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
