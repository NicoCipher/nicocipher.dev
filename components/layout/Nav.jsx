"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePalette } from "@/components/command-palette/PaletteProvider";
import styles from "./Nav.module.css";

export default function Nav() {
  const pathname = usePathname();
  const { openPalette } = usePalette();

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
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

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
    </header>
  );
}
