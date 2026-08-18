"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePalette } from "@/components/command-palette/PaletteProvider";
import { useEffect, useState } from "react";
import styles from "./Nav.module.css";

export default function Nav() {
  const pathname = usePathname();
  const { openPalette } = usePalette();
  const [theme, setTheme] = useState("dark");

  // Initialise from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("nc-theme");
    const initial = stored || "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("nc-theme", next);
  };

  const links = [
    { href: "/publications", label: "publications" },
    { href: "/systems", label: "systems" },
    { href: "/about", label: "about" },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.brand}>
          nicocipher<span className={styles.brandExt}>.dev</span>
        </Link>

        <nav className={styles.nav} aria-label="Primary navigation">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.link} ${isActive ? styles.active : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.controls}>
          <button
            type="button"
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? "○" : "●"}
          </button>

          <button
            type="button"
            onClick={openPalette}
            className={styles.paletteTrigger}
            aria-label="Open command palette (Press /)"
            title="Command Palette (Press /)"
          >
            <span className={styles.triggerKey}>[ / ]</span>
          </button>
        </div>
      </div>
    </header>
  );
}
