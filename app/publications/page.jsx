import { getAllPublications } from "@/lib/publications";
import PublicationsClient from "@/components/content/PublicationsClient";
import styles from "./page.module.css";

export const metadata = {
  title: "Publications — NICOCIPHER",
  description:
    "Master index of engineering projects, case studies, labs, and research notes. Evidence-backed technical publications.",
};

const VALID_TYPES = ["project", "case-study", "lab", "research"];

export default async function PublicationsIndexPage({ searchParams }) {
  const params = await searchParams;
  const initialType = VALID_TYPES.includes(params?.type) ? params.type : "all";
  const allPubs = getAllPublications();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Publications</h1>
        <p className={styles.subtitle}>
          Structured, evidence-backed documentation across infrastructure, cybersecurity,
          networking, and software engineering.
        </p>
        <div className={styles.readerNote}>
          💡 <strong>Recruiter &amp; Non-Technical Quick Tip:</strong> Every publication opens with a 30-second executive summary and everyday analogy explaining the business impact before the technical terminal logs.
        </div>
      </header>

      {/* Client component handles instant filtering + URL sync */}
      <PublicationsClient publications={allPubs} initialType={initialType} />
    </div>
  );
}
