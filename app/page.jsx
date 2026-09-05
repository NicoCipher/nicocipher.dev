import Link from "next/link";
import profile from "@/data/profile.json";
import { getAllPublications } from "@/lib/publications";
import CurrentlyBlock from "@/components/home/CurrentlyBlock";
import FeaturedPublications from "@/components/home/FeaturedPublications";
import TerminalHero from "@/components/home/TerminalHero";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/Icons";
import styles from "./page.module.css";

export default function HomePage() {
  const allPubs = getAllPublications();
  const featured = allPubs.filter((p) => p.featured).slice(0, 4);

  // Publication stats for the briefing
  const stats = {
    total: allPubs.length,
    projects: allPubs.filter((p) => p.type === "project").length,
    caseStudies: allPubs.filter((p) => p.type === "case-study").length,
    labs: allPubs.filter((p) => p.type === "lab").length,
    research: allPubs.filter((p) => p.type === "research").length,
  };

  return (
    <div className={styles.container}>

      {/* Identity Briefing */}
      <section className={styles.briefing}>
        <div className={styles.identityHeader}>
          <div className={styles.titleRow}>
            <h1 className={styles.name}>{profile.name}</h1>
            <span className={styles.handleBadge}>@{profile.handle}</span>
          </div>
          <div className={styles.roleRow}>
            <p className={styles.role}>{profile.role}</p>
            <span className={styles.locationTag}>📍 {profile.location}</span>
          </div>
        </div>

        <p className={styles.bio}>
          {profile.bio}
        </p>

        <div className={styles.actionsRow}>
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionBtn}
            aria-label="GitHub Profile"
          >
            <GitHubIcon size={14} />
            <span>GitHub</span>
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.actionBtn}
            aria-label="LinkedIn Profile"
          >
            <LinkedInIcon size={14} />
            <span>LinkedIn</span>
          </a>
          <a
            href={`mailto:${profile.email}`}
            className={styles.actionBtn}
          >
            <span>Email</span>
          </a>
          <Link
            href="/publications"
            className={`${styles.actionBtn} ${styles.actionPrimary}`}
          >
            <span>Projects &amp; Labs ({stats.total})</span>
            <span className={styles.arrow} aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* Live Terminal Evidence — Instant Proof */}
      <TerminalHero />

      {/* Verified Engineering Output Breakdown */}
      <section className={styles.statsSection} aria-label="Verified engineering output breakdown">
        <div className={styles.statsHeader}>
          <span className={styles.statsTag}>Verified Output</span>
          <span className={styles.statsMeta}>{stats.total} Complete Artifacts</span>
        </div>
        <div className={styles.statsRow}>
          <Link href="/publications" className={styles.statCard}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>All Work</span>
          </Link>
          <Link href="/publications?type=project" className={styles.statCard}>
            <span className={styles.statValue}>{stats.projects}</span>
            <span className={styles.statLabel}>Projects</span>
          </Link>
          <Link href="/publications?type=lab" className={styles.statCard}>
            <span className={styles.statValue}>{stats.labs}</span>
            <span className={styles.statLabel}>Hands-on Labs</span>
          </Link>
          <Link href="/publications?type=case-study" className={styles.statCard}>
            <span className={styles.statValue}>{stats.caseStudies}</span>
            <span className={styles.statLabel}>Case Studies</span>
          </Link>
          <Link href="/publications?type=research" className={styles.statCard}>
            <span className={styles.statValue}>{stats.research}</span>
            <span className={styles.statLabel}>Research Notes</span>
          </Link>
        </div>
      </section>

      {/* Currently Operating */}
      <CurrentlyBlock />

      {/* Featured Publications */}
      <FeaturedPublications publications={featured} totalCount={stats.total} />

      {/* Closing Call to Action */}
      <section className={styles.ctaSection} aria-label="Contact and collaboration">
        <div className={styles.ctaCard}>
          <span className={styles.ctaTag}>Available for Opportunities</span>
          <h2 className={styles.ctaTitle}>Let&apos;s build dependable infrastructure.</h2>
          <p className={styles.ctaText}>
            I am actively open to engineering roles across Infrastructure, Networking, and Cybersecurity. If you need someone who learns fast, documents thoroughly, and solves real problems, let&apos;s connect.
          </p>
          <div className={styles.ctaActions}>
            <a href={`mailto:${profile.email}`} className={styles.ctaPrimary}>
              Email Me ({profile.email}) →
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaSecondary}
              aria-label="LinkedIn Profile"
            >
              <LinkedInIcon size={14} />
              <span>LinkedIn</span>
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaSecondary}
              aria-label="GitHub Profile"
            >
              <GitHubIcon size={14} />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: profile.name,
            jobTitle: profile.role,
            url: "https://nicocipher.dev",
            sameAs: [profile.github, profile.linkedin].filter(Boolean),
          }),
        }}
      />
    </div>
  );
}
