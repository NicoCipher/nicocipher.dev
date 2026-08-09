"use client";

import { createContext, useContext, useState, useEffect } from "react";
import CommandPalette from "./CommandPalette";

const PaletteContext = createContext({
  isOpen: false,
  openPalette: () => {},
  closePalette: () => {},
});

export function usePalette() {
  return useContext(PaletteContext);
}

export default function PaletteProvider({ children, searchIndex = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  const openPalette = () => setIsOpen(true);
  const closePalette = () => setIsOpen(false);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")
      ) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Body scroll lock when palette is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  return (
    <PaletteContext.Provider value={{ isOpen, openPalette, closePalette }}>
      {children}
      {isOpen && <CommandPalette searchIndex={searchIndex} onClose={closePalette} />}
    </PaletteContext.Provider>
  );
}
