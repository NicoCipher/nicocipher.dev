"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import styles from "./Toast.module.css";

const ToastContext = createContext({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((message, duration = 2500) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ id: Date.now(), message });
    timerRef.current = setTimeout(() => {
      setToast(null);
    }, duration);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={styles.toast}
          onClick={() => setToast(null)}
        >
          <span className={styles.toastDot} aria-hidden="true" />
          <span className={styles.toastMessage}>{toast.message}</span>
          <span className={styles.toastDismiss} aria-hidden="true">×</span>
        </div>
      )}
    </ToastContext.Provider>
  );
}
