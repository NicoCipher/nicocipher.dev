"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

/* ── Theme definitions ──────────────────────────────────────────────────── */
const THEMES = [
  {
    id: "dark",
    name: "Dark",
    desc: "Pure black, electric blue",
    bg: "#0a0a0a", surface: "#111111", border: "#252525",
    text: "#efefef", textDim: "#a0a0a0",
    accent: "#3b82f6",
  },
  {
    id: "midnight",
    name: "Midnight",
    desc: "GitHub Dark, sky blue",
    bg: "#0d1117", surface: "#161b22", border: "#30363d",
    text: "#e6edf3", textDim: "#8d96a0",
    accent: "#58a6ff",
  },
  {
    id: "terminal",
    name: "Terminal",
    desc: "Unix green on black",
    bg: "#0b0f0b", surface: "#111811", border: "#243024",
    text: "#d0e8d0", textDim: "#8aaa8a",
    accent: "#00d084",
  },
  {
    id: "paper",
    name: "Paper",
    desc: "Warm cream, amber",
    bg: "#f7f3ec", surface: "#f0ebe1", border: "#ccc4b4",
    text: "#1a1614", textDim: "#5a4f44",
    accent: "#b45309",
  },
  {
    id: "nord",
    name: "Nord",
    desc: "Arctic blue-grey, frost",
    bg: "#2e3440", surface: "#3b4252", border: "#434c5e",
    text: "#eceff4", textDim: "#d8dee9",
    accent: "#88c0d0",
  },
  {
    id: "light",
    name: "Light",
    desc: "GitHub Light, blue",
    bg: "#ffffff", surface: "#f6f8fa", border: "#d0d7de",
    text: "#1f2328", textDim: "#656d76",
    accent: "#2563eb",
  },
];

/* ── Font definitions ───────────────────────────────────────────────────── */
const FONTS = [
  {
    id: "editorial",
    name: "Editorial",
    sans: "Instrument Sans",
    serif: "Source Serif 4",
    mono: "JetBrains Mono",
    sansVar: "var(--font-instrument-sans), sans-serif",
    monoVar: "var(--font-jetbrains-mono), monospace",
    sample: "Engineering at depth.",
  },
  {
    id: "system",
    name: "System",
    sans: "Inter",
    serif: "Inter",
    mono: "JetBrains Mono",
    sansVar: "var(--font-inter), sans-serif",
    monoVar: "var(--font-jetbrains-mono), monospace",
    sample: "Engineering at depth.",
  },
  {
    id: "ibm",
    name: "IBM Plex",
    sans: "IBM Plex Sans",
    serif: "IBM Plex Serif",
    mono: "IBM Plex Mono",
    sansVar: "var(--font-ibm-plex-sans), sans-serif",
    monoVar: "var(--font-ibm-plex-mono), monospace",
    sample: "Engineering at depth.",
  },
  {
    id: "space",
    name: "Space",
    sans: "Space Grotesk",
    serif: "Space Grotesk",
    mono: "Space Mono",
    sansVar: "var(--font-space-grotesk), sans-serif",
    monoVar: "var(--font-space-mono), monospace",
    sample: "Engineering at depth.",
  },
  {
    id: "dm",
    name: "DM",
    sans: "DM Sans",
    serif: "DM Sans",
    mono: "JetBrains Mono",
    sansVar: "var(--font-dm-sans), sans-serif",
    monoVar: "var(--font-jetbrains-mono), monospace",
    sample: "Engineering at depth.",
  },
];

/* ── Component ──────────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const [activeTheme, setActiveTheme] = useState("dark");
  const [activeFont,  setActiveFont]  = useState("editorial");

  useEffect(() => {
    setActiveTheme(localStorage.getItem("nc-theme") || "dark");
    setActiveFont (localStorage.getItem("nc-font")  || "editorial");
  }, []);

  function applyTheme(id) {
    setActiveTheme(id);
    localStorage.setItem("nc-theme", id);
    document.documentElement.setAttribute("data-theme", id);
  }

  function applyFont(id) {
    setActiveFont(id);
    localStorage.setItem("nc-font", id);
    document.documentElement.setAttribute("data-font", id);
  }

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>Changes apply instantly and persist across sessions.</p>
        </div>
        <Link href="/workspace" className={styles.back}>← Publications</Link>
      </div>

      {/* ── Themes ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Theme</h2>
        <div className={styles.themeGrid}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => applyTheme(t.id)}
              className={`${styles.themeCard} ${activeTheme === t.id ? styles.selected : ""}`}
              aria-pressed={activeTheme === t.id}
              title={t.name}
            >
              {/* Mini site preview */}
              <div
                className={styles.themePreview}
                style={{ background: t.bg, borderColor: t.border }}
              >
                {/* Fake nav bar */}
                <div className={styles.previewNav} style={{ background: t.surface, borderColor: t.border }}>
                  <span className={styles.previewDot} style={{ background: t.text, opacity: 0.9 }} />
                  <span className={styles.previewDot} style={{ background: t.textDim, opacity: 0.5 }} />
                  <span className={styles.previewDot} style={{ background: t.textDim, opacity: 0.3 }} />
                </div>
                {/* Fake content */}
                <div className={styles.previewBody}>
                  <div className={styles.previewLine}
                    style={{ background: t.text, width: "55%", opacity: 0.9 }} />
                  <div className={styles.previewLine}
                    style={{ background: t.textDim, width: "75%", opacity: 0.6 }} />
                  <div className={styles.previewLine}
                    style={{ background: t.textDim, width: "45%", opacity: 0.4 }} />
                  {/* Accent chip */}
                  <div className={styles.previewChip} style={{ background: t.accent, opacity: 0.85 }} />
                </div>
              </div>
              {/* Label */}
              <div className={styles.themeLabel}>
                <span className={styles.themeName}>{t.name}</span>
                <span className={styles.themeDesc}>{t.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Fonts ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Typography</h2>
        <div className={styles.fontGrid}>
          {FONTS.map((f) => (
            <button
              key={f.id}
              onClick={() => applyFont(f.id)}
              className={`${styles.fontCard} ${activeFont === f.id ? styles.selected : ""}`}
              aria-pressed={activeFont === f.id}
            >
              <div className={styles.fontPreview}>
                <div
                  className={styles.fontAa}
                  style={{ fontFamily: f.sansVar }}
                >
                  Aa
                </div>
                <div
                  className={styles.fontSample}
                  style={{ fontFamily: f.sansVar }}
                >
                  {f.sample}
                </div>
                <div
                  className={styles.fontMono}
                  style={{ fontFamily: f.monoVar }}
                >
                  ./nicocipher.dev
                </div>
              </div>
              <div className={styles.fontLabel}>
                <span className={styles.fontName}>{f.name}</span>
                <span className={styles.fontPair}>{f.sans} · {f.mono}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

    </div>
  );
}
