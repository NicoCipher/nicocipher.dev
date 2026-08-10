import "@/app/globals.css";
import { Instrument_Sans, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import SkipLink from "@/components/layout/SkipLink";
import PaletteProvider from "@/components/command-palette/PaletteProvider";
import { buildSearchIndex } from "@/lib/search";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://nicocipher.dev"),
  title: {
    template: "%s — NICOCIPHER",
    default: "NICOCIPHER — Engineering Portfolio Publication System",
  },
  description:
    "An engineering portfolio publication system documenting evidence-backed work across cybersecurity, infrastructure, networking, and software engineering.",
  authors: [{ name: "NicoCipher", url: "https://github.com/NicoCipher" }],
  icons: {
    icon: "/favicon.svg",
  },
  other: {
    "theme-color": "#111110",
  },
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
      className={`${instrumentSans.variable} ${sourceSerif.variable} ${jetBrainsMono.variable}`}
    >
      <body>
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
