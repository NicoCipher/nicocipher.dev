"use client";

import { useEffect, useRef } from "react";
import styles from "./ConfirmModal.module.css";

export default function ConfirmModal({ title, message, confirmLabel = "Confirm", onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const handleKey = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div className={styles.overlay} onClick={onCancel} role="presentation">
      <div
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        onClick={e => e.stopPropagation()}
      >
        <p className={styles.title} id="confirm-title">{title}</p>
        {message && <p className={styles.message} id="confirm-message">{message}</p>}
        <div className={styles.actions}>
          <button ref={cancelRef} className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button className={styles.confirmBtn} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
