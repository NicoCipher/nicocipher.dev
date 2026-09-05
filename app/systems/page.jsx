import domains from "@/data/domains.json";
import { getAllPublications } from "@/lib/publications";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata = {
  title: "Technology & Systems Taxonomy Map",
  description: "Map of engineering domains, technologies, and cross-linked publications.",
};

const CORE_CONCEPTS = [
  {
    term: "Active Directory & Kerberos",
    description: "Centralized identity management and ticket-based authentication. Eliminates fragmented per-machine credentials by enforcing single-sign-on and domain-wide access control.",
  },
  {
    term: "OSPF & Dynamic Routing",
    description: "Link-state interior gateway protocol that maintains topological maps of the network and automatically recalculates optimal forwarding paths during link failures.",
  },
  {
    term: "VLANs (802.1Q)",
    description: "Logical Layer 2 segmentation within shared physical switches, isolating broadcast domains and enforcing traffic separation between departmental networks.",
  },
  {
    term: "IPv4 Subnetting",
    description: "Hierarchical IP address space allocation using variable-length subnet masks (VLSM) to optimize routing boundaries and prevent address space exhaustion.",
  },
  {
    term: "Headless Linux Administration",
    description: "Managing remote server instances via authenticated OpenSSH without graphical desktop overhead, enforcing least-privilege command-line workflows.",
  },
  {
    term: "Session Cookie Security",
    description: "Browser state authorization secured with HttpOnly, Secure, and SameSite directives to prevent credential hijacking and cross-site script theft.",
  },
  {
    term: "Threat Modeling (STRIDE)",
    description: "Structured evaluation of software and network architectures to identify trust boundaries, threat actors, and attack surfaces before deployment.",
  },
  {
    term: "Layer 2 ARP vs. Default Gateway",
    description: "Host-level routing logic determining whether destination traffic resolves via local Layer 2 broadcast resolution or forwards through a Layer 3 default gateway.",
  },
];

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

      {/* Architecture & Protocol Reference */}
      <section className={styles.decoderSection} aria-label="Architecture & Protocol Reference">
        <div className={styles.decoderHeader}>
          <span className={styles.decoderTag}>Core Concepts</span>
          <h2 className={styles.decoderTitle}>Architecture &amp; Protocol Reference</h2>
          <p className={styles.decoderSubtitle}>
            A concise reference for core protocols, directory services, and network boundaries implemented across these publications.
          </p>
        </div>
        <div className={styles.decoderGrid}>
          {CORE_CONCEPTS.map((item) => (
            <div key={item.term} className={styles.decoderCard}>
              <span className={styles.decoderTerm}>{item.term}</span>
              <p className={styles.decoderDescription}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

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
