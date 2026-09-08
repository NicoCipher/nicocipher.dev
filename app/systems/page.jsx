import domains from "@/data/domains.json";
import { getAllPublications } from "@/lib/publications";
import SystemsMatrix from "@/components/systems/SystemsMatrix";
import styles from "./page.module.css";

export const metadata = {
  title: "Systems & Skills Matrix | NicoCipher",
  description: "Evidence-linked matrix of verified engineering competencies, systems architectures, protocols, and technical publications.",
};

export default function SystemsPage() {
  const publications = getAllPublications();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.tagline}>OPERATIONAL COMPETENCY &amp; ARCHITECTURE</span>
        <h1 className={styles.title}>Systems &amp; Skills Matrix</h1>
        <p className={styles.subtitle}>
          Verified technical competencies, operational systems, and dynamic routing architectures cross-referenced to reproducible lab and case study evidence.
        </p>
      </header>

      <SystemsMatrix domains={domains} publications={publications} />
    </div>
  );
}
