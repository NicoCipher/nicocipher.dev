"use client";

import styles from "./EvidenceEditor.module.css";

const EVIDENCE_TYPES = ["terminal", "snippet", "config", "log", "diagram", "artifact"];
const LANGUAGES = ["bash", "cmd", "json", "yaml", "text", "javascript", "python", "css", "html"];

function emptyEvidence() {
  return { id: "", type: "terminal", title: "", content: "", language: "bash" };
}

export default function EvidenceEditor({ evidence = [], onChange }) {
  const update = (idx, field, value) => {
    const next = [...evidence];
    next[idx] = { ...next[idx], [field]: value };
    onChange(next);
  };

  const add = () => onChange([...evidence, emptyEvidence()]);

  const remove = (idx) => onChange(evidence.filter((_, i) => i !== idx));

  const moveUp = (idx) => {
    if (idx === 0) return;
    const next = [...evidence];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };

  const moveDown = (idx) => {
    if (idx === evidence.length - 1) return;
    const next = [...evidence];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>Evidence ({evidence.length})</span>
        <button type="button" className={styles.addBtn} onClick={add}>+ Add Evidence</button>
      </div>

      {evidence.map((ev, idx) => (
        <div key={idx} className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIndex}>#{idx + 1}</span>
            <div className={styles.cardActions}>
              <button type="button" className={styles.actionBtn} onClick={() => moveUp(idx)} disabled={idx === 0}>↑</button>
              <button type="button" className={styles.actionBtn} onClick={() => moveDown(idx)} disabled={idx === evidence.length - 1}>↓</button>
              <button type="button" className={`${styles.actionBtn} ${styles.removeBtn}`} onClick={() => remove(idx)}>×</button>
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Type</label>
              <select className={styles.select} value={ev.type} onChange={(e) => update(idx, "type", e.target.value)}>
                {EVIDENCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>ID</label>
              <input className={styles.input} value={ev.id || ""} onChange={(e) => update(idx, "id", e.target.value)} placeholder="unique-id" />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Language</label>
              <select className={styles.select} value={ev.language || "text"} onChange={(e) => update(idx, "language", e.target.value)}>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Title</label>
            <input className={styles.input} value={ev.title || ""} onChange={(e) => update(idx, "title", e.target.value)} placeholder="Evidence title" />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Content</label>
            <textarea
              className={styles.textarea}
              value={ev.content || ""}
              onChange={(e) => update(idx, "content", e.target.value)}
              placeholder="Paste terminal output, code, or log content..."
              rows={6}
            />
          </div>
        </div>
      ))}

      {evidence.length === 0 && (
        <div className={styles.empty}>No evidence blocks. Click "+ Add Evidence" to start.</div>
      )}
    </div>
  );
}
