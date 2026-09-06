"use client";

import { slugify } from "@/lib/serializer";
import styles from "./MetadataForm.module.css";

const TYPES = ["project", "case-study", "lab", "research"];
const STATUSES = ["complete", "active", "paused", "planned"];
const DOMAINS = ["infrastructure", "networking", "security", "development", "creative"];

export default function MetadataForm({ data, onChange, isNew = false, errors = {} }) {
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
          <label htmlFor="meta-type" className={styles.label}>Type</label>
          <select
            id="meta-type"
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
          <label htmlFor="meta-status" className={styles.label}>Status</label>
          <select
            id="meta-status"
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
          <label htmlFor="meta-domain" className={styles.label}>
            Domain <span aria-hidden="true" style={{ color: "var(--status-warn)" }}>*</span>
          </label>
          <select
            id="meta-domain"
            className={`${styles.select} ${errors.domain ? styles.inputError : ""}`}
            value={data.domain || ""}
            onChange={(e) => update("domain", e.target.value)}
            aria-invalid={Boolean(errors.domain)}
            aria-describedby={errors.domain ? "domain-error" : undefined}
          >
            <option value="">Select...</option>
            {DOMAINS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {errors.domain && (
            <span id="domain-error" className={styles.errorText} role="alert">
              {errors.domain}
            </span>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="meta-title" className={styles.label}>
          Title <span aria-hidden="true" style={{ color: "var(--status-warn)" }}>*</span>
        </label>
        <input
          id="meta-title"
          className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
          value={data.title || ""}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Publication title"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "title-error" : undefined}
        />
        {errors.title && (
          <span id="title-error" className={styles.errorText} role="alert">
            {errors.title}
          </span>
        )}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="meta-slug" className={styles.label}>Slug</label>
          <input
            id="meta-slug"
            className={styles.input}
            value={data.slug || ""}
            onChange={(e) => update("slug", e.target.value)}
            placeholder="url-slug"
            disabled={!isNew}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="meta-date" className={styles.label}>Date</label>
          <input
            id="meta-date"
            className={styles.input}
            type="date"
            value={data.date || ""}
            onChange={(e) => update("date", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="meta-effort" className={styles.label}>Effort</label>
          <input
            id="meta-effort"
            className={styles.input}
            value={data.effort || ""}
            onChange={(e) => update("effort", e.target.value)}
            placeholder="e.g. 3h"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="meta-summary" className={styles.label}>Summary</label>
        <textarea
          id="meta-summary"
          className={styles.textarea}
          value={data.summary || ""}
          onChange={(e) => update("summary", e.target.value)}
          placeholder="One-line summary for index pages and search..."
          rows={2}
        />
      </div>

      <div className={styles.checkRow}>
        <label htmlFor="meta-featured" className={styles.checkLabel}>
          <input
            id="meta-featured"
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
