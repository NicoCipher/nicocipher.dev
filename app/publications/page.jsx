import { getAllPublications } from "@/lib/publications";
import PublicationsClient from "@/components/content/PublicationsClient";
import styles from "./page.module.css";

export const metadata = {
  title: "Publications — NICOCIPHER",
  description:
    "Master index of engineering projects, case studies, labs, and research notes. Evidence-backed technical publications.",
};

const VALID_TYPES = ["project", "case-study", "lab", "research"];
const VALID_DOMAINS = ["networking", "infrastructure", "security", "development"];

export default async function PublicationsIndexPage({ searchParams }) {
  const params = await searchParams;
  const initialType = VALID_TYPES.includes(params?.type) ? params.type : "all";
  const initialDomain = VALID_DOMAINS.includes(params?.domain) ? params.domain : "all";
  const allPubs = getAllPublications();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Projects &amp; Engineering Labs</h1>
        <p className={styles.subtitle}>
          Structured, evidence-backed projects, hands-on infrastructure labs, troubleshooting case studies, and security research.
        </p>
      </header>

      {/* Client component handles instant filtering + URL sync */}
      <PublicationsClient
        publications={allPubs}
        initialType={initialType}
        initialDomain={initialDomain}
      />
    </div>
  );
}
