import styles from "./StatusBadge.module.css";

const STATUS_CONFIGS = {
  complete: { label: "Complete", symbol: "●" },
  active:   { label: "Active",   symbol: "●" },
  paused:   { label: "Paused",   symbol: "○" },
  planned:  { label: "Planned",  symbol: "○" },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIGS[status] ?? { label: status, symbol: "○" };

  return (
    <span
      className={`${styles.badge} ${styles[status] ?? styles.planned}`}
      aria-label={`Status: ${config.label}`}
    >
      <span className={styles.symbol} aria-hidden="true">
        {config.symbol}
      </span>
      {config.label}
    </span>
  );
}
