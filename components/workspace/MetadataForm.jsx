"use client";

import { slugify } from "@/lib/serializer";
import styles from "./MetadataForm.module.css";

const TYPES = ["project", "case-study", "lab", "research"];
const STATUSES = ["complete", "active", "paused", "planned"];
const DOMAINS = ["infrastructure", "networking", "security", "development", "creative"];

export default function MetadataForm({ data, onChange, isNew = false }) {
  const update = (field, value) => {
    const next = { ...data, [field]: value };

    // Auto-generate slug from title for new publications
    if (field === "title" && isNew) {
      next.slug = slugify(value);
    }

    onChange(next);
  };

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Type</label>
          <select
            className={styles.select}
            value={data.type || "lab"}
            onChange={(e) => update("type", e.target.value)}
            disabled={!isNew}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Status</label>
          <select
            className={styles.select}
            value={data.status || "complete"}
            onChange={(e) => update("status", e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Domain</label>
          <select
            className={styles.select}
            value={data.domain || ""}
            onChange={(e) => update("domain", e.target.value)}
          >
            <option value="">Select...</option>
            {DOMAINS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Title</label>
        <input
          className={styles.input}
          value={data.title || ""}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Publication title"
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Slug</label>
          <input
            className={styles.input}
            value={data.slug || ""}
            onChange={(e) => update("slug", e.target.value)}
            placeholder="url-slug"
            disabled={!isNew}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Date</label>
          <input
            className={styles.input}
            type="date"
            value={data.date || ""}
            onChange={(e) => update("date", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Effort</label>
          <input
            className={styles.input}
            value={data.effort || ""}
            onChange={(e) => update("effort", e.target.value)}
            placeholder="e.g. 3h"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Summary</label>
        <textarea
          className={styles.textarea}
          value={data.summary || ""}
          onChange={(e) => update("summary", e.target.value)}
          placeholder="One-line summary for index pages and search..."
          rows={2}
        />
      </div>

      <div className={styles.checkRow}>
        <label className={styles.checkLabel}>
          <input
            type="checkbox"
            checked={data.featured || false}
            onChange={(e) => update("featured", e.target.checked)}
            className={styles.checkbox}
          />
          Featured on homepage
        </label>
      </div>
    </div>
  );
}
