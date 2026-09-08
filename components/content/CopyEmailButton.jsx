"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import styles from "./CopyEmailButton.module.css";

export default function CopyEmailButton({ email }) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      showToast(`✓ Copied ${email} to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      showToast(`✓ Copied ${email} to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={styles.wrapper}>
      <a href={`mailto:${email}`} className={styles.emailLink} title="Open default mail client">
        {email}
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className={`${styles.copyBtn} ${copied ? styles.copied : ""}`}
        aria-label={`Copy email address ${email}`}
        title="Copy email to clipboard"
      >
        <span>{copied ? "✓" : "⧉"}</span>
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
