import domains from "@/data/domains.json";
import { getAllPublications } from "@/lib/publications";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata = {
  title: "Technology & Systems Taxonomy Map",
  description: "Map of engineering domains, technologies, and cross-linked publications.",
};

const DECODER_ITEMS = [
  {
    term: "Active Directory & Kerberos",
    analogy: "The company's master pass and employee directory. Lets staff log into computers and file shares securely without typing 50 different passwords.",
  },
  {
    term: "OSPF & Dynamic Routing",
    analogy: "Like a real-time GPS app for network traffic. If one network wire is cut, data instantly reroutes around the failure in milliseconds.",
  },
  {
    term: "VLANs (Virtual LANs)",
    analogy: "Virtual office drywall. Keeps guest Wi-Fi, HR payroll records, and server traffic completely isolated even though they share the same physical switch.",
  },
  {
    term: "IPv4 Subnetting",
    analogy: "Carving a large parcel of real estate into clearly numbered private office lots, preventing computer address collisions.",
  },
  {
    term: "Headless Linux & SSH",
    analogy: "Managing high-performance cloud servers with no monitor or mouse attached, controlling them securely across the internet through encrypted command lines.",
  },
  {
    term: "Session Cookie Security",
    analogy: "Protecting digital wristbands at an event. Ensuring hackers cannot copy a user's temporary browser token to bypass the login screen.",
  },
  {
    term: "Threat Modeling (STRIDE)",
    analogy: "A safety inspection before building a house. Finding structural security vulnerabilities in software blueprints before hackers can exploit them.",
  },
  {
    term: "Layer 2 ARP vs. Default Gateway",
    analogy: "Deciding whether to walk over and hand a letter to your desk neighbor directly (Layer 2 ARP) or drop it in the outgoing mail slot for the post office (Gateway).",
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

      {/* Non-Technical Decoder */}
      <section className={styles.decoderSection} aria-label="Non-Technical Technology Decoder">
        <div className={styles.decoderHeader}>
          <span className={styles.decoderTag}>Non-Technical Decoder</span>
          <h2 className={styles.decoderTitle}>What these systems actually do in plain English</h2>
          <p className={styles.decoderSubtitle}>
            A quick reference for recruiters and hiring managers translating infrastructure jargon into practical business value.
          </p>
        </div>
        <div className={styles.decoderGrid}>
          {DECODER_ITEMS.map((item) => (
            <div key={item.term} className={styles.decoderCard}>
              <span className={styles.decoderTerm}>{item.term}</span>
              <p className={styles.decoderAnalogy}>{item.analogy}</p>
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
