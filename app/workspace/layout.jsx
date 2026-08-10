"use client";

import { useState, useEffect } from "react";
import { getToken, clearToken, validateToken } from "@/lib/github";
import TokenGate from "@/components/workspace/TokenGate";
import styles from "./layout.module.css";

export default function WorkspaceLayout({ children }) {
  const [authState, setAuthState] = useState("loading"); // loading | unauthenticated | authenticated
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthState("unauthenticated");
      return;
    }

    validateToken().then((user) => {
      if (user) {
        setUsername(user);
        setAuthState("authenticated");
      } else {
        clearToken();
        setAuthState("unauthenticated");
      }
    });
  }, []);

  const handleAuthenticated = (user) => {
    setUsername(user);
    setAuthState("authenticated");
  };

  const handleSignOut = () => {
    clearToken();
    setUsername(null);
    setAuthState("unauthenticated");
  };

  if (authState === "loading") {
    return (
      <div className={styles.workspace}>
        <div className={styles.loading}>Authenticating...</div>
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return (
      <div className={styles.workspace}>
        <header className={styles.header}>
          <span className={styles.brand}>workspace</span>
          <a href="/" className={styles.exitLink}>← back to site</a>
        </header>
        <TokenGate onAuthenticated={handleAuthenticated} />
      </div>
    );
  }

  return (
    <div className={styles.workspace}>
      <head>
        <meta name="robots" content="noindex, nofollow" />
        <title>Workspace — NICOCIPHER</title>
      </head>
      <header className={styles.header}>
        <span className={styles.brand}>workspace</span>
        <span className={styles.user}>@{username}</span>
        <div className={styles.headerActions}>
          <a href="/" className={styles.exitLink}>← site</a>
          <button className={styles.signOutBtn} onClick={handleSignOut}>sign out</button>
        </div>
      </header>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}
