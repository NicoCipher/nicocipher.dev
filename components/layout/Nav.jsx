"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePalette } from "@/components/command-palette/PaletteProvider";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/Icons";
import styles from "./Nav.module.css";

export default function Nav() {
  const pathname = usePathname();
  const { openPalette } = usePalette();

  const links = [
    { href: "/publications", label: "projects & labs" },
    { href: "/systems",      label: "systems & skills" },
    { href: "/about",        label: "about"            },
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

        <div className={styles.rightGroup}>
          <a
            href="https://github.com/NicoCipher"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconLink}
            aria-label="GitHub Profile"
            title="GitHub"
          >
            <GitHubIcon size={16} />
          </a>
          <a
            href="https://linkedin.com/in/nicocipher"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconLink}
            aria-label="LinkedIn Profile"
            title="LinkedIn"
          >
            <LinkedInIcon size={16} />
          </a>
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
