import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicationBySlug, getAllPublications } from "@/lib/publications";
import { getRelatedPublications } from "@/lib/related";
import styles from "./page.module.css";

export async function generateStaticParams() {
  const pubs = getAllPublications();
  return pubs.map((p) => ({
    type: p.type,
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { type, slug } = await params;
  try {
    const pub = getPublicationBySlug(type, slug);
    return {
      title: `${pub.title} — NICOCIPHER`,
      description: pub.summary,
    };
  } catch {
    return { title: "Publication Not Found — NICOCIPHER" };
  }
}

export default async function PublicationPage({ params }) {
  const { type, slug } = await params;

  let pub;
  try {
    pub = getPublicationBySlug(type, slug);
  } catch {
    notFound();
  }

  const related = getRelatedPublications(pub);

  return (
    <article className={styles.container}>
      {/* Breadcrumb Trail */}
      <div className={styles.breadcrumb}>
        <Link href="/publications">publications</Link>
        <span className={styles.sep}>/</span>
        <Link href={`/publications?type=${pub.type}`}>{pub.type}</Link>
        <span className={styles.sep}>/</span>
        <span className={styles.current}>{pub.slug}</span>
      </div>

      {/* Meta Header */}
      <header className={styles.header}>
        <div className={styles.typeRow}>
          <span className={styles.typeBadge}>{pub.type}</span>
          <span className={styles.statusBadge}>● {pub.status}</span>
          <span className={styles.date}>{pub.date}</span>
          {pub.effort && <span className={styles.effort}>· Effort: {pub.effort}</span>}
        </div>

        <h1 className={styles.title}>{pub.title}</h1>
        {pub.summary && <p className={styles.summary}>{pub.summary}</p>}

        {/* Structured Meta Grid */}
        <div className={styles.metaGrid}>
          <div className={styles.metaField}>
            <span className={styles.metaLabel}>Domain</span>
            <span className={styles.metaValue}>{pub.domain}</span>
          </div>
          {pub.technologies?.length > 0 && (
            <div className={styles.metaField}>
              <span className={styles.metaLabel}>Technologies</span>
              <div className={styles.tagGroup}>
                {pub.technologies.map((tech) => (
                  <span key={tech} className={styles.techTag}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
          {pub.tags?.length > 0 && (
            <div className={styles.metaField}>
              <span className={styles.metaLabel}>Tags</span>
              <div className={styles.tagGroup}>
                {pub.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* First-Class Evidence Section (if present) */}
      {pub.evidence?.length > 0 && (
        <section className={styles.evidenceSection}>
          <h2 className={styles.evidenceSectionTitle}>[ Attachments & Evidence ]</h2>
          <div className={styles.evidenceGrid}>
            {pub.evidence.map((item) => (
              <div key={item.id} className={styles.evidenceCard}>
                <div className={styles.evidenceHeader}>
                  <span className={styles.evidenceType}>{item.type}</span>
                  <span className={styles.evidenceTitle}>{item.title}</span>
                </div>
                {item.content && (
                  <pre className={styles.evidencePre}>
                    <code>{item.content}</code>
                  </pre>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Body Content */}
      <div
        className={styles.prose}
        dangerouslySetInnerHTML={{ __html: pub.html }}
      />

      {/* Related Publications */}
      {related.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>[ Related Publications ]</h2>
          <div className={styles.relatedGrid}>
            {related.map((rel) => (
              <Link
                key={rel.type + rel.slug}
                href={`/publications/${rel.type}/${rel.slug}`}
                className={styles.relatedCard}
              >
                <span className={styles.typeBadge}>{rel.type}</span>
                <h3 className={styles.relatedCardTitle}>{rel.title}</h3>
                <p className={styles.relatedSummary}>{rel.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
