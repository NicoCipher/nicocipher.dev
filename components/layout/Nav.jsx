"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePalette } from "@/components/command-palette/PaletteProvider";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/Icons";
import styles from "./Nav.module.css";

export default function Nav() {
  const pathname = usePathname();
  const { openPalette } = usePalette();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const firstLinkRef = useRef(null);
  const drawerRef = useRef(null);

  const links = [
    { href: "/publications", label: "Projects & Labs" },
    { href: "/systems",      label: "Systems & Skills" },
    { href: "/about",        label: "About"            },
  ];

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Handle Escape key and focus management
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      } else if (e.key === "Tab" && drawerRef.current) {
        // Focus trap inside drawer
        const focusable = drawerRef.current.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    // Body scroll lock
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    // Initial focus on first link
    setTimeout(() => {
      firstLinkRef.current?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      menuButtonRef.current?.focus();
    } else {
      setIsMenuOpen(true);
    }
  };

  const isHome = pathname === "/";

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link
          href="/"
          className={styles.brand}
          aria-current={isHome ? "page" : undefined}
          aria-label="NICOCIPHER homepage"
        >
          nicocipher<span className={styles.brandExt}>.dev</span>
        </Link>

        {/* Desktop Navigation */}
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

        {/* Right Group: Social + Command Palette + Mobile Toggle */}
        <div className={styles.rightGroup}>
          <a
            href="https://github.com/NicoCipher"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconLink}
            aria-label="GitHub Profile (opens in new tab)"
            title="GitHub"
          >
            <GitHubIcon size={16} />
          </a>
          <a
            href="https://linkedin.com/in/nicocipher"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconLink}
            aria-label="LinkedIn Profile (opens in new tab)"
            title="LinkedIn"
          >
            <LinkedInIcon size={16} />
          </a>
          <button
            type="button"
            onClick={openPalette}
            className={styles.paletteTrigger}
            aria-label="Search and command palette (Press / or Cmd+K)"
            title="Search & Command Palette (/)"
          >
            <span className={styles.triggerLabel}>Search</span>
            <span className={styles.triggerKey} aria-hidden="true">[ / ]</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            ref={menuButtonRef}
            type="button"
            className={styles.mobileMenuBtn}
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            <span className={styles.menuIconBox} aria-hidden="true">
              <span className={`${styles.menuLine} ${isMenuOpen ? styles.menuLineTopOpen : ""}`} />
              <span className={`${styles.menuLine} ${isMenuOpen ? styles.menuLineBottomOpen : ""}`} />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop & Menu */}
      {isMenuOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={() => {
            setIsMenuOpen(false);
            menuButtonRef.current?.focus();
          }}
          aria-hidden="true"
        />
      )}

      <div
        id="mobile-nav-drawer"
        ref={drawerRef}
        className={`${styles.mobileDrawer} ${isMenuOpen ? styles.mobileDrawerOpen : ""}`}
        aria-hidden={!isMenuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        <div className={styles.drawerHeader}>
          <span className={styles.drawerTitle}>Navigation</span>
          <button
            type="button"
            className={styles.drawerCloseBtn}
            onClick={() => {
              setIsMenuOpen(false);
              menuButtonRef.current?.focus();
            }}
            aria-label="Close navigation menu"
          >
            ✕
          </button>
        </div>

        <nav className={styles.mobileNav} aria-label="Mobile primary navigation">
          <Link
            ref={firstLinkRef}
            href="/"
            className={`${styles.mobileLink} ${isHome ? styles.mobileLinkActive : ""}`}
            aria-current={isHome ? "page" : undefined}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ""}`}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.drawerFooter}>
          <button
            type="button"
            className={styles.mobilePaletteBtn}
            onClick={() => {
              setIsMenuOpen(false);
              openPalette();
            }}
          >
            <span>Search & Command Palette</span>
            <kbd className={styles.mobileKbd}>/</kbd>
          </button>

          <div className={styles.mobileSocials}>
            <a
              href="https://github.com/NicoCipher"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mobileSocialLink}
            >
              <GitHubIcon size={16} />
              <span>GitHub</span>
            </a>
            <a
              href="https://linkedin.com/in/nicocipher"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mobileSocialLink}
            >
              <LinkedInIcon size={16} />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
