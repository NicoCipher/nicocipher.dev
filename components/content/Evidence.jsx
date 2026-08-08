/**
 * Evidence rendering components for nicocipher.dev
 * Each evidence type renders with specific, purposeful UI.
 * All components are server-side — zero client JS.
 */

import styles from "./Evidence.module.css";

// ─── Terminal / Shell Log ──────────────────────────────────────────────────

function TerminalBlock({ item }) {
  return (
    <div className={styles.card} data-type="terminal">
      <div className={styles.cardHeader}>
        <div className={styles.terminalDots}>
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.dot} aria-hidden="true" />
        </div>
        <span className={styles.cardType}>terminal</span>
        <span className={styles.cardTitle}>{item.title}</span>
      </div>
      <pre className={styles.terminalPre} tabIndex={0} aria-label={`Terminal output: ${item.title}`}>
        <code className={styles.terminalCode}>{item.content?.trim()}</code>
      </pre>
    </div>
  );
}

// ─── Diagram / Architecture Image ─────────────────────────────────────────

function DiagramBlock({ item }) {
  return (
    <figure className={styles.card} data-type="diagram">
      <div className={styles.cardHeader}>
        <span className={styles.cardType}>diagram</span>
        <span className={styles.cardTitle}>{item.title}</span>
      </div>
      <div className={styles.diagramWrapper}>
        {item.src ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={item.src}
            alt={item.caption || item.title}
            className={styles.diagramImage}
          />
        ) : (
          <div className={styles.diagramPlaceholder}>
            <span>[ diagram: {item.title} ]</span>
            {item.src && <span className={styles.diagramSrc}>{item.src}</span>}
          </div>
        )}
      </div>
      {item.caption && (
        <figcaption className={styles.diagramCaption}>{item.caption}</figcaption>
      )}
    </figure>
  );
}

// ─── Config / Code Snippet ─────────────────────────────────────────────────

function CodeBlock({ item }) {
  const lang = item.language || "text";
  return (
    <div className={styles.card} data-type="config">
      <div className={styles.cardHeader}>
        <span className={styles.cardType}>{item.type}</span>
        <span className={styles.cardTitle}>{item.title}</span>
        <span className={styles.cardLang}>{lang}</span>
      </div>
      <pre
        className={styles.codePre}
        tabIndex={0}
        aria-label={`${item.type}: ${item.title}`}
      >
        <code className={`${styles.codeBlock} language-${lang}`}>
          {item.content?.trim()}
        </code>
      </pre>
    </div>
  );
}

// ─── Log Output ────────────────────────────────────────────────────────────

function LogBlock({ item }) {
  return (
    <div className={styles.card} data-type="log">
      <div className={styles.cardHeader}>
        <span className={styles.cardType}>log</span>
        <span className={styles.cardTitle}>{item.title}</span>
      </div>
      <pre className={styles.logPre} tabIndex={0} aria-label={`Log output: ${item.title}`}>
        <code className={styles.logCode}>{item.content?.trim()}</code>
      </pre>
    </div>
  );
}

// ─── Downloadable Artifact ─────────────────────────────────────────────────

function ArtifactBlock({ item }) {
  return (
    <div className={styles.card} data-type="artifact">
      <div className={styles.cardHeader}>
        <span className={styles.cardType}>artifact</span>
        <span className={styles.cardTitle}>{item.title}</span>
      </div>
      <div className={styles.artifactBody}>
        <div className={styles.artifactInfo}>
          <span className={styles.artifactIcon} aria-hidden="true">⬇</span>
          <div className={styles.artifactMeta}>
            <span className={styles.artifactName}>{item.title}</span>
            {item.size && (
              <span className={styles.artifactSize}>{item.size}</span>
            )}
          </div>
        </div>
        {item.downloadUrl ? (
          <a
            href={item.downloadUrl}
            className={styles.artifactDownload}
            download
            aria-label={`Download ${item.title}`}
          >
            Download
          </a>
        ) : (
          <span className={styles.artifactUnavailable}>Linked externally</span>
        )}
      </div>
      {item.checksum && (
        <div className={styles.artifactChecksum}>
          <span className={styles.checksumLabel}>SHA256</span>
          <code className={styles.checksumValue}>{item.checksum}</code>
        </div>
      )}
    </div>
  );
}

// ─── Dispatch: select renderer by evidence type ────────────────────────────

function EvidenceItem({ item }) {
  switch (item.type) {
    case "terminal":
      return <TerminalBlock item={item} />;
    case "diagram":
      return <DiagramBlock item={item} />;
    case "config":
    case "snippet":
      return <CodeBlock item={item} />;
    case "log":
      return <LogBlock item={item} />;
    case "artifact":
    case "pcap":
      return <ArtifactBlock item={item} />;
    default:
      // Unknown types fall back to code block
      return <CodeBlock item={item} />;
  }
}

// ─── Evidence Section ──────────────────────────────────────────────────────

export default function EvidenceSection({ evidence }) {
  if (!evidence || evidence.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Evidence and attachments">
      <h2 className={styles.sectionTitle}>
        <span className={styles.sectionBracket}>[</span>
        Evidence & Attachments
        <span className={styles.sectionBracket}>]</span>
        <span className={styles.sectionCount}>{evidence.length}</span>
      </h2>
      <div className={styles.evidenceList}>
        {evidence.map((item) => (
          <EvidenceItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
