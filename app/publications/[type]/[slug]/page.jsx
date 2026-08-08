import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicationBySlug, getAllPublications, getAdjacentPublications } from "@/lib/publications";
import { getRelatedPublications } from "@/lib/related";
import Breadcrumb from "@/components/layout/Breadcrumb";
import MetaBlock from "@/components/content/MetaBlock";
import EvidenceSection from "@/components/content/Evidence";
import EntryNav from "@/components/content/EntryNav";
import StatusBadge from "@/components/content/StatusBadge";
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
      openGraph: {
        title: pub.title,
        description: pub.summary,
        type: "article",
        publishedTime: pub.date,
        tags: pub.tags,
      },
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
  const { prev, next } = getAdjacentPublications(type, slug);

  return (
    <article className={styles.container}>

      {/* Breadcrumb */}
      <Breadcrumb segments={[
        { label: "publications", href: "/publications" },
        { label: pub.type, href: `/publications?type=${pub.type}` },
        { label: pub.slug },
      ]} />

      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>{pub.title}</h1>
        {pub.summary && <p className={styles.summary}>{pub.summary}</p>}
      </header>

      {/* Structured Metadata */}
      <MetaBlock pub={pub} />

      {/* Evidence — rendered before body so context is set before prose */}
      <EvidenceSection evidence={pub.evidence} />

      {/* Publication Body */}
      <div
        className={styles.prose}
        dangerouslySetInnerHTML={{ __html: pub.html }}
      />

      {/* Related Publications */}
      {related.length > 0 && (
        <section className={styles.relatedSection} aria-label="Related publications">
          <h2 className={styles.relatedTitle}>
            <span aria-hidden="true">[ </span>Related Publications<span aria-hidden="true"> ]</span>
          </h2>
          <div className={styles.relatedGrid}>
            {related.map((rel) => (
              <Link
                key={rel.type + rel.slug}
                href={`/publications/${rel.type}/${rel.slug}`}
                className={styles.relatedCard}
              >
                <div className={styles.relatedCardMeta}>
                  <span className={styles.relatedType}>{rel.type}</span>
                  <StatusBadge status={rel.status} />
                </div>
                <h3 className={styles.relatedCardTitle}>{rel.title}</h3>
                <p className={styles.relatedSummary}>{rel.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Prev / Next Navigation */}
      <EntryNav prev={prev} next={next} />

    </article>
  );
}
