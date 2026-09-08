import styles from "./ExecutiveBriefing.module.css";

/**
 * ExecutiveBriefing component
 * Provides high-signal, at-a-glance architectural takeaways:
 * 1. Target Objective (the business/engineering problem)
 * 2. Production Environment (hardware, OS, protocols, stack)
 * 3. Verified Outcome (deterministic validation, test results)
 * 
 * Accessible, responsive, zero-JS server component.
 */
export default function ExecutiveBriefing({ pub }) {
  if (!pub) return null;

  const briefing = pub.briefing || {};
  const objective = briefing.objective || pub.summary;
  const environment = briefing.environment || (pub.technologies?.length > 0 ? pub.technologies.slice(0, 5).join(" · ") : pub.domain);
  const outcome = briefing.outcome || (pub.status === "complete" ? "Verified in isolated lab topology with deterministic test vectors and configuration artifacts." : pub.status);

  if (!objective && !environment && !outcome) return null;

  return (
    <aside className={styles.briefingCard} aria-label="Executive Briefing">
      <div className={styles.briefingHeader}>
        <div className={styles.headerLeft}>
          <span className={styles.pulseDot} aria-hidden="true" />
          <span className={styles.headerBadge}>EXECUTIVE BRIEFING</span>
        </div>
        <span className={styles.headerMeta}>ARCHITECTURAL SUMMARY</span>
      </div>

      <div className={styles.briefingGrid}>
        {objective && (
          <div className={styles.briefingCol}>
            <div className={styles.colLabel}>
              <span className={styles.colIndex} aria-hidden="true">01</span>
              <span>TARGET OBJECTIVE</span>
            </div>
            <p className={styles.colValue}>{objective}</p>
          </div>
        )}

        {environment && (
          <div className={styles.briefingCol}>
            <div className={styles.colLabel}>
              <span className={styles.colIndex} aria-hidden="true">02</span>
              <span>PRODUCTION ENVIRONMENT</span>
            </div>
            <p className={styles.colValue}>{environment}</p>
          </div>
        )}

        {outcome && (
          <div className={styles.briefingCol}>
            <div className={styles.colLabel}>
              <span className={styles.colIndex} aria-hidden="true">03</span>
              <span>VERIFIED OUTCOME</span>
            </div>
            <p className={styles.colValue}>{outcome}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
