"use client";

import { useState } from "react";
import { setToken, validateToken } from "@/lib/github";
import styles from "./TokenGate.module.css";

export default function TokenGate({ onAuthenticated }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    // Temporarily set token for validation
    setToken(trimmed);
    const username = await validateToken();

    if (username) {
      onAuthenticated(username);
    } else {
      setError("Invalid token — could not authenticate with GitHub.");
      setToken("");
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.icon}>🔑</span>
          <h2 className={styles.title}>GitHub Authentication</h2>
        </div>
        <p className={styles.description}>
          Enter a GitHub personal access token with <code className={styles.code}>repo</code> scope to
          read and write publications.
        </p>
        <p className={styles.detail}>
          Your token is stored in this browser only and is never sent anywhere except api.github.com.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="password"
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            autoComplete="off"
            spellCheck="false"
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.submitBtn} disabled={loading || !input.trim()}>
            {loading ? "Verifying..." : "Connect"}
          </button>
        </form>

        <a
          href="https://github.com/settings/tokens/new?scopes=repo&description=nicocipher.dev+workspace"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.generateLink}
        >
          Generate a token on GitHub →
        </a>
      </div>
    </div>
  );
}
