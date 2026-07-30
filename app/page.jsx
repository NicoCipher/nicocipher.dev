import Link from "next/link";
import profile from "@/data/profile.json";
import currently from "@/data/currently.json";
import { getAllPublications } from "@/lib/publications";
import styles from "./page.module.css";

export default function HomePage() {
  const allPubs = getAllPublications();
  const featured = allPubs.filter((p) => p.featured).slice(0, 4);

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
            <span key={d} className={styles.domainTag}>
              {d}
            </span>
          ))}
        </div>
      </section>

      {/* Currently Operating */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>[ Currently Operating ]</h2>
        <div className={styles.currentlyGrid}>
          <div className={styles.currentlyCard}>
            <span className={styles.currentlyLabel}>Studying</span>
            <p className={styles.currentlyValue}>{currently.studying.label}</p>
            <p className={styles.currentlyDetail}>{currently.studying.detail}</p>
          </div>
          <div className={styles.currentlyCard}>
            <span className={styles.currentlyLabel}>Building</span>
            <p className={styles.currentlyValue}>{currently.building.label}</p>
            <p className={styles.currentlyDetail}>{currently.building.detail}</p>
          </div>
          <div className={styles.currentlyCard}>
            <span className={styles.currentlyLabel}>Thinking About</span>
            <p className={styles.currentlyValue}>{currently.thinking.label}</p>
            <p className={styles.currentlyDetail}>{currently.thinking.detail}</p>
          </div>
        </div>
      </section>

      {/* Featured Publications */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>[ Featured Publications ]</h2>
          <Link href="/publications" className={styles.viewAll}>
            View All ({allPubs.length}) &rarr;
          </Link>
        </div>

        <div className={styles.publicationList}>
          {featured.map((pub) => (
            <Link
              key={pub.type + pub.slug}
              href={`/publications/${pub.type}/${pub.slug}`}
              className={styles.pubRow}
            >
              <div className={styles.pubRowMeta}>
                <span className={styles.typeBadge}>{pub.type}</span>
                <span className={styles.pubDate}>{pub.date}</span>
              </div>
              <div className={styles.pubRowContent}>
                <h3 className={styles.pubTitle}>{pub.title}</h3>
                <p className={styles.pubSummary}>{pub.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
