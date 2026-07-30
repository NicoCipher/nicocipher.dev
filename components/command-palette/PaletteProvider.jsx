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

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle palette on / or Cmd+K / Ctrl+K
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

  return (
    <PaletteContext.Provider value={{ isOpen, openPalette, closePalette }}>
      {children}
      {isOpen && <CommandPalette searchIndex={searchIndex} onClose={closePalette} />}
    </PaletteContext.Provider>
  );
}
