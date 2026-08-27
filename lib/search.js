import { getAllPublications } from "./publications";
// Pure scoring logic lives in searchClient.js (browser-safe, no Node imports).
// Re-exported here so server code can use a single import path if needed.
export { searchIndex } from "./searchClient";


const PUBLICATION_KINDS = {
  project:    "Project",
  "case-study": "Case Study",
  lab:        "Lab",
  research:   "Research Note",
};

/**
 * Builds the full search index at build time / layout render time.
 *
 * Each entry:
 *   { id, kind, type, title, slug, url, tags, technologies, domain,
 *     excerpt, status, readingTime, evidenceTypes }
 *
 * kind = "publication" | "page" | "type-filter"
 */
export function buildSearchIndex() {
  const publications = getAllPublications();

  const publicationEntries = publications.map((pub) => ({
    id: `pub:${pub.type}:${pub.slug}`,
    kind: "publication",
    type: pub.type,
    typeLabel: PUBLICATION_KINDS[pub.type] ?? pub.type,
    title: pub.title,
    slug: pub.slug,
    url: `/publications/${pub.type}/${pub.slug}`,
    tags: pub.tags || [],
    technologies: pub.technologies || [],
    domain: pub.domain || "",
    excerpt: pub.summary || "",
    status: pub.status || "complete",
    readingTime: pub.readingTime || "",
    // Index evidence types so you can search "terminal" or "pcap"
    evidenceTypes: (pub.evidence || []).map((e) => e.type),
  }));

  const pageEntries = [
    {
      id: "page:home",
      kind: "page",
      type: "page",
      typeLabel: "Page",
      title: "Home",
      url: "/",
      tags: ["home", "briefing", "identity"],
      technologies: [],
      domain: "",
      excerpt: "The briefing — engineering identity, current focus, featured work.",
      status: "complete",
      readingTime: "",
      evidenceTypes: [],
    },
    {
      id: "page:publications",
      kind: "page",
      type: "page",
      typeLabel: "Page",
      title: "Publications Index",
      url: "/publications",
      tags: ["publications", "index", "all"],
      technologies: [],
      domain: "",
      excerpt: "Master index of all engineering publications.",
      status: "complete",
      readingTime: "",
      evidenceTypes: [],
    },
    {
      id: "page:systems",
      kind: "page",
      type: "page",
      typeLabel: "Page",
      title: "Technology & Systems Map",
      url: "/systems",
      tags: ["systems", "technology", "taxonomy", "skills"],
      technologies: [],
      domain: "",
      excerpt: "Taxonomy of engineering domains and tools cross-linked to publications.",
      status: "complete",
      readingTime: "",
      evidenceTypes: [],
    },
    {
      id: "page:about",
      kind: "page",
      type: "page",
      typeLabel: "Page",
      title: "About & Methodology",
      url: "/about",
      tags: ["about", "methodology", "author", "colophon"],
      technologies: [],
      domain: "",
      excerpt: "Engineering background, methodology principles, contact.",
      status: "complete",
      readingTime: "",
      evidenceTypes: [],
    },
  ];

  // Type-filter shortcuts — allow "type:lab" or just "labs" to jump to filter
  const typeFilterEntries = Object.entries(PUBLICATION_KINDS).map(([id, label]) => ({
    id: `filter:${id}`,
    kind: "type-filter",
    type: id,
    typeLabel: "Filter",
    title: `Browse ${label}s`,
    url: `/publications?type=${id}`,
    tags: [id, label.toLowerCase(), "filter", "browse"],
    technologies: [],
    domain: "",
    excerpt: `View all ${label.toLowerCase()} publications.`,
    status: "complete",
    readingTime: "",
    evidenceTypes: [],
  }));

  // Theme switching — discoverable via command palette
  const themeEntries = [
    { id: "dark",       name: "Dark",       tags: ["dark", "black", "default"] },
    { id: "light",      name: "Light",      tags: ["light", "white", "bright"] },
    { id: "midnight",   name: "Midnight",   tags: ["midnight", "github", "dark"] },
    { id: "terminal",   name: "Terminal",   tags: ["terminal", "green", "hacker", "unix"] },
    { id: "paper",      name: "Paper",      tags: ["paper", "warm", "cream", "sepia"] },
    { id: "nord",       name: "Nord",       tags: ["nord", "arctic", "blue"] },
    { id: "dracula",    name: "Dracula",    tags: ["dracula", "purple", "vampire"] },
    { id: "catppuccin", name: "Catppuccin", tags: ["catppuccin", "mocha", "pastel"] },
    { id: "gruvbox",    name: "Gruvbox",    tags: ["gruvbox", "retro", "warm", "amber"] },
    { id: "solarized",  name: "Solarized",  tags: ["solarized", "ocean", "teal"] },
  ].map((t) => ({
    id: `theme:${t.id}`,
    kind: "theme",
    type: "theme",
    typeLabel: "Theme",
    title: `Switch to ${t.name}`,
    url: null,
    action: { type: "theme", value: t.id },
    tags: ["theme", "appearance", ...t.tags],
    technologies: [],
    domain: "",
    excerpt: `Apply the ${t.name} color theme.`,
    status: "complete",
    readingTime: "",
    evidenceTypes: [],
  }));

  const fontEntries = [
    { id: "editorial", name: "Editorial",  tags: ["editorial", "instrument", "sans"] },
    { id: "geist",     name: "Geist",      tags: ["geist", "vercel", "modern"] },
    { id: "system",    name: "System",     tags: ["system", "inter", "default"] },
    { id: "ibm",       name: "IBM Plex",   tags: ["ibm", "plex", "monospaced"] },
    { id: "fraunces",  name: "Fraunces",   tags: ["fraunces", "serif", "decorative"] },
    { id: "space",     name: "Space",      tags: ["space", "grotesk", "geometric"] },
    { id: "dm",        name: "DM",         tags: ["dm", "sans", "clean"] },
    { id: "fira",      name: "Fira Code",  tags: ["fira", "code", "ligatures"] },
  ].map((f) => ({
    id: `font:${f.id}`,
    kind: "font",
    type: "font",
    typeLabel: "Font",
    title: `Use ${f.name} typography`,
    url: null,
    action: { type: "font", value: f.id },
    tags: ["font", "typography", ...f.tags],
    technologies: [],
    domain: "",
    excerpt: `Switch to the ${f.name} font pairing.`,
    status: "complete",
    readingTime: "",
    evidenceTypes: [],
  }));

  return [...publicationEntries, ...pageEntries, ...typeFilterEntries, ...themeEntries, ...fontEntries];
}
