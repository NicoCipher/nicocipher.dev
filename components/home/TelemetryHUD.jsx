"use client";

import { useState, useEffect } from "react";
import { isSoundEnabled, setSoundEnabled, playSoftClick } from "@/lib/sound";
import styles from "./TelemetryHUD.module.css";

export default function TelemetryHUD() {
  const [soundOn, setSoundOn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSoundOn(isSoundEnabled());
  }, []);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      setTimeout(playSoftClick, 50);
    }
  };

  return (
    <div className={styles.hudBar} role="region" aria-label="System Telemetry Status">
      <div className={styles.hudLeft}>
        <span className={styles.hudStatusDot} aria-hidden="true" />
        <span className={styles.hudStatusText}>ALL SYSTEMS NOMINAL</span>
        <span className={styles.hudDivider} aria-hidden="true">|</span>
        <span className={styles.hudDetail}>0 CVEs · 7-THREAD CSP ENFORCED</span>
      </div>

      <div className={styles.hudRight}>
        <span className={styles.hudArtifacts}>100% REPRODUCIBLE ARTIFACTS</span>
        {mounted && (
          <button
            type="button"
            className={`${styles.soundToggle} ${soundOn ? styles.soundActive : ""}`}
            onClick={handleToggleSound}
            aria-label={soundOn ? "Disable cyber audio haptics" : "Enable cyber audio haptics"}
            title={soundOn ? "Mute cyber audio" : "Enable tactile sound feedback"}
          >
            <span aria-hidden="true">{soundOn ? "🔊" : "🔈"}</span>
            <span className={styles.soundLabel}>Audio: {soundOn ? "ON" : "OFF"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
