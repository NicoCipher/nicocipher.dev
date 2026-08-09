import Link from "next/link";
import profile from "@/data/profile.json";
import { getAllPublications } from "@/lib/publications";
import CurrentlyBlock from "@/components/home/CurrentlyBlock";
import FeaturedPublications from "@/components/home/FeaturedPublications";
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
          <h1 className={styles.name}>{profile.name}</h1>
          <p className={styles.role}>{profile.role}</p>
        </div>
        <p className={styles.bio}>{profile.bio}</p>
        <div className={styles.domainTags}>
          {profile.domains.map((d) => (
            <span key={d} className={styles.domainTag}>{d}</span>
          ))}
        </div>
      </section>

      {/* Publication Statistics */}
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

      {/* Currently Operating */}
      <CurrentlyBlock />

      {/* Featured Publications */}
      <FeaturedPublications publications={featured} totalCount={stats.total} />

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
