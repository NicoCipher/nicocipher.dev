"use client";

import { useState, useRef } from "react";
import styles from "./TagInput.module.css";

export default function TagInput({ label, values = [], onChange }) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInputValue("");
  };

  const removeTag = (tag) => {
    onChange(values.filter((t) => t !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && values.length > 0) {
      removeTag(values[values.length - 1]);
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputArea} onClick={() => inputRef.current?.focus()}>
        {values.map((tag) => (
          <span key={tag} className={styles.chip}>
            {tag}
            <button
              type="button"
              className={styles.chipRemove}
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (inputValue.trim()) addTag(inputValue); }}
          placeholder={values.length === 0 ? "Type and press Enter..." : ""}
        />
      </div>
    </div>
  );
}
