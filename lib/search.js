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

  return [...publicationEntries, ...pageEntries, ...typeFilterEntries];
}
