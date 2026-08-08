import Link from "next/link";
import styles from "./MetaBlock.module.css";
import StatusBadge from "./StatusBadge";

export default function MetaBlock({ pub }) {
  const {
    type,
    status,
    date,
    effort,
    domain,
    technologies = [],
    tags = [],
  } = pub;

  return (
    <div className={styles.metaBlock} role="complementary" aria-label="Publication metadata">
      <div className={styles.row}>
        <Field label="Type">
          <Link
            href={`/publications?type=${type}`}
            className={styles.typeLink}
          >
            {type}
          </Link>
        </Field>

        <Field label="Status">
          <StatusBadge status={status} />
        </Field>

        <Field label="Date">
          <time dateTime={date} className={styles.mono}>
            {date}
          </time>
        </Field>

        {effort && (
          <Field label="Effort">
            <span className={styles.mono}>{effort}</span>
          </Field>
        )}

        {domain && (
          <Field label="Domain">
            <span className={styles.mono}>{domain}</span>
          </Field>
        )}
      </div>

      {technologies.length > 0 && (
        <div className={styles.tagRow}>
          <span className={styles.tagLabel}>Technologies</span>
          <div className={styles.tags}>
            {technologies.map((tech) => (
              <span key={tech} className={styles.techTag}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className={styles.tagRow}>
          <span className={styles.tagLabel}>Tags</span>
          <div className={styles.tags}>
            {tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <div className={styles.value}>{children}</div>
    </div>
  );
}
