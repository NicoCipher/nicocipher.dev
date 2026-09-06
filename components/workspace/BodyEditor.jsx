"use client";

import styles from "./BodyEditor.module.css";

export default function BodyEditor({ body = "", onChange }) {
  return (
    <div className={styles.container}>
      <label htmlFor="pub-body-markdown" className={styles.label}>Body (Markdown)</label>
      <textarea
        id="pub-body-markdown"
        className={styles.editor}
        value={body}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your publication body in Markdown..."
        spellCheck="false"
      />
    </div>
  );
}
