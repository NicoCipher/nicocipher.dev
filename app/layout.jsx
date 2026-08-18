import "@/app/globals.css";
import {
  Instrument_Sans, Source_Serif_4, JetBrains_Mono,
  Inter,
  IBM_Plex_Sans, IBM_Plex_Serif, IBM_Plex_Mono,
  Space_Grotesk, Space_Mono,
  DM_Sans,
} from "next/font/google";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import SkipLink from "@/components/layout/SkipLink";
import PaletteProvider from "@/components/command-palette/PaletteProvider";
import { buildSearchIndex } from "@/lib/search";

/* ── Fonts ─────────────────────────────────────────────────────── */
const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument-sans", display: "swap" });
const sourceSerif    = Source_Serif_4 ({ subsets: ["latin"], variable: "--font-source-serif",    display: "swap" });
const jetBrainsMono  = JetBrains_Mono ({ subsets: ["latin"], variable: "--font-jetbrains-mono",  display: "swap" });
const inter          = Inter           ({ subsets: ["latin"], variable: "--font-inter",           display: "swap" });
const ibmPlexSans    = IBM_Plex_Sans  ({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-ibm-plex-sans",  display: "swap" });
const ibmPlexSerif   = IBM_Plex_Serif ({ subsets: ["latin"], weight: ["400","600"],             variable: "--font-ibm-plex-serif", display: "swap" });
const ibmPlexMono    = IBM_Plex_Mono  ({ subsets: ["latin"], weight: ["400","500","600"],       variable: "--font-ibm-plex-mono",  display: "swap" });
const spaceGrotesk   = Space_Grotesk  ({ subsets: ["latin"], variable: "--font-space-grotesk",  display: "swap" });
const spaceMono      = Space_Mono     ({ subsets: ["latin"], weight: ["400","700"],             variable: "--font-space-mono",     display: "swap" });
const dmSans         = DM_Sans        ({ subsets: ["latin"], variable: "--font-dm-sans",         display: "swap" });

const allFontVars = [
  instrumentSans.variable, sourceSerif.variable, jetBrainsMono.variable,
  inter.variable,
  ibmPlexSans.variable, ibmPlexSerif.variable, ibmPlexMono.variable,
  spaceGrotesk.variable, spaceMono.variable,
  dmSans.variable,
].join(" ");

/* ── Metadata ──────────────────────────────────────────────────── */
export const metadata = {
  metadataBase: new URL("https://nicocipher.dev"),
  title: {
    template: "%s — NICOCIPHER",
    default: "NICOCIPHER — Engineering Portfolio",
  },
  description:
    "An engineering portfolio documenting evidence-backed work across cybersecurity, infrastructure, networking, and software engineering.",
  authors: [{ name: "NicoCipher", url: "https://github.com/NicoCipher" }],
  icons: { icon: "/favicon.svg" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  const searchIndex = buildSearchIndex();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={allFontVars}
    >
      <body>
        {/* Anti-flash: apply stored theme + font before first paint */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('nc-theme')||'dark';var f=localStorage.getItem('nc-font')||'editorial';document.documentElement.setAttribute('data-theme',t);document.documentElement.setAttribute('data-font',f);}catch(e){document.documentElement.setAttribute('data-theme','dark');document.documentElement.setAttribute('data-font','editorial');}})();`,
          }}
        />
        <SkipLink />
        <PaletteProvider searchIndex={searchIndex}>
          <Nav />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </PaletteProvider>
      </body>
    </html>
  );
}
