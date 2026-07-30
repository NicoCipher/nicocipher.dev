import { getAllPublications } from "./publications";

/**
 * Builds a search index array at build time / layout render time.
 */
export function buildSearchIndex() {
  const publications = getAllPublications();

  const publicationEntries = publications.map((pub) => ({
    type: pub.type, // project | case-study | lab | research-note
    title: pub.title,
    slug: pub.slug,
    tags: pub.tags || [],
    excerpt: pub.summary || pub.excerpt || "",
    status: pub.status || "complete",
    url: `/publications/${pub.type}/${pub.slug}`,
  }));

  const pageEntries = [
    { type: "page", title: "Home — The Briefing", url: "/", tags: ["home", "briefing"] },
    { type: "page", title: "Publications Index", url: "/publications", tags: ["publications", "all"] },
    { type: "page", title: "Technology Map", url: "/systems", tags: ["systems", "tech", "skills"] },
    { type: "page", title: "About & Methodology", url: "/about", tags: ["about", "author", "bio"] },
  ];

  return [...publicationEntries, ...pageEntries];
}
