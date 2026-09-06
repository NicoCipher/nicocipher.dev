"use client";

import { useEffect, useRef } from "react";
import styles from "./ConfirmModal.module.css";

export default function ConfirmModal({ title, message, confirmLabel = "Confirm", onConfirm, onCancel }) {
  const triggerRef = useRef(null);
  const cancelRef = useRef(null);
  const confirmRef = useRef(null);

  useEffect(() => {
    triggerRef.current = document.activeElement;
    cancelRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancel();
      } else if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === cancelRef.current) {
          e.preventDefault();
          confirmRef.current?.focus();
        } else if (!e.shiftKey && document.activeElement === confirmRef.current) {
          e.preventDefault();
          cancelRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
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
          <button ref={cancelRef} className={styles.cancelBtn} onClick={onCancel} type="button">
            Cancel
          </button>
          <button ref={confirmRef} className={styles.confirmBtn} onClick={onConfirm} type="button">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
