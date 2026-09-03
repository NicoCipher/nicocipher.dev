import Link from "next/link";
import profile from "@/data/profile.json";
import { getAllPublications } from "@/lib/publications";
import CurrentlyBlock from "@/components/home/CurrentlyBlock";
import FeaturedPublications from "@/components/home/FeaturedPublications";
import Heatmap from "@/components/home/Heatmap";
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

  // All publication dates for the heatmap
  const pubDates = allPubs.map((p) => p.date);

  return (
    <div className={styles.container}>

      {/* Identity Briefing */}
      <section className={styles.briefing}>
        <div className={styles.identityHeader}>
          <h1 className={styles.name}>{profile.name}</h1>
          <p className={styles.role}>{profile.role}</p>
        </div>
        <p className={styles.bio}>
          Most security knowledge claims are assertions. Mine are documented with terminal output,
          packet captures, and reproducible procedures. Everything published here started with
          something breaking.
        </p>
        <div className={styles.domainTags}>
          {profile.domains.map((d) => (
            <span key={d} className={styles.domainTag}>{d}</span>
          ))}
        </div>

        <div className={styles.socialRow}>
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialBadge}
            aria-label="GitHub Profile"
          >
            <GitHubIcon size={14} />
            <span>GitHub</span>
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialBadge}
            aria-label="LinkedIn Profile"
          >
            <LinkedInIcon size={14} />
            <span>LinkedIn</span>
          </a>
          <a
            href={`mailto:${profile.email}`}
            className={styles.socialBadge}
          >
            Email Me →
          </a>
          <Link
            href="/publications"
            className={styles.socialBadge}
          >
            Browse All ({stats.total}) Publications →
          </Link>
        </div>
      </section>

      {/* Engineering Standards & Verification */}
      <section className={styles.guideSection} aria-label="Engineering Standards and Principles">
        <div className={styles.guideHeader}>
          <span className={styles.guideTag}>Engineering Standards</span>
          <h2 className={styles.guideTitle}>How I approach, verify, and document systems</h2>
        </div>
        <div className={styles.guideGrid}>
          <div className={styles.guideCard}>
            <span className={styles.guideNum}>01</span>
            <h3 className={styles.guideCardTitle}>Real Environments, Not Just Code</h3>
            <p className={styles.guideCardText}>
              Configured real Windows Server 2022 Active Directory, headless Ubuntu servers, and enterprise Cisco switches. Every project is verified in functional lab environments.
            </p>
          </div>
          <div className={styles.guideCard}>
            <span className={styles.guideNum}>02</span>
            <h3 className={styles.guideCardTitle}>The &quot;What Broke&quot; Standard</h3>
            <p className={styles.guideCardText}>
              Every publication documents the mistakes, error messages, and how they were fixed. It proves troubleshooting persistence under pressure rather than textbook memorization.
            </p>
          </div>
          <div className={styles.guideCard}>
            <span className={styles.guideNum}>03</span>
            <h3 className={styles.guideCardTitle}>Plain-English Business Clarity</h3>
            <p className={styles.guideCardText}>
              Every technical build is accompanied by clear takeaways, everyday analogies, and the real-world business reason why the architecture matters.
            </p>
          </div>
        </div>
      </section>

      {/* Live Terminal Evidence */}
      <TerminalHero />

      {/* Activity Heatmap */}
      <section className={styles.heatmapSection} aria-label="Publication activity">
        <Heatmap dates={pubDates} />
      </section>

      {/* Publication Statistics — only meaningful once there's volume */}
      {stats.total >= 10 && (
        <section className={styles.statsSection} aria-label="Publication statistics">
          <div className={styles.statsRow}>
            <Link href="/publications" className={styles.statCard}>
              <span className={styles.statValue}>{stats.total}</span>
              <span className={styles.statLabel}>Publications</span>
            </Link>
            <Link href="/publications?type=project" className={styles.statCard}>
              <span className={styles.statValue}>{stats.projects}</span>
              <span className={styles.statLabel}>Projects</span>
            </Link>
            <Link href="/publications?type=case-study" className={styles.statCard}>
              <span className={styles.statValue}>{stats.caseStudies}</span>
              <span className={styles.statLabel}>Case Studies</span>
            </Link>
            <Link href="/publications?type=lab" className={styles.statCard}>
              <span className={styles.statValue}>{stats.labs}</span>
              <span className={styles.statLabel}>Labs</span>
            </Link>
            <Link href="/publications?type=research" className={styles.statCard}>
              <span className={styles.statValue}>{stats.research}</span>
              <span className={styles.statLabel}>Research</span>
            </Link>
          </div>
        </section>
      )}

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
