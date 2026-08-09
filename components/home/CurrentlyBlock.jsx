import Link from "next/link";
import currently from "@/data/currently.json";
import styles from "./CurrentlyBlock.module.css";

const ENTRIES = [
  { key: "studying", label: "Studying", data: currently.studying },
  { key: "building", label: "Building", data: currently.building },
  { key: "thinking", label: "Thinking About", data: currently.thinking },
];

export default function CurrentlyBlock() {
  return (
    <section className={styles.section} aria-label="Current focus areas">
      <h2 className={styles.sectionTitle}>
        <span aria-hidden="true">[</span> Currently Operating <span aria-hidden="true">]</span>
      </h2>
      <div className={styles.grid}>
        {ENTRIES.map(({ key, label, data }) => {
          const inner = (
            <>
              <span className={styles.label}>{label}</span>
              <p className={styles.value}>{data.label}</p>
              <p className={styles.detail}>{data.detail}</p>
            </>
          );

          return data.link ? (
            <Link key={key} href={data.link} className={styles.card}>
              {inner}
              <span className={styles.arrow} aria-hidden="true">→</span>
            </Link>
          ) : (
            <div key={key} className={styles.card}>
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}
