import fs from "fs";
import path from "path";
import { parseMarkdownFile } from "./content";

const PUBLICATIONS_DIR = path.join(process.cwd(), "content", "publications");

const VALID_TYPES = ["project", "case-study", "lab", "research"];

function isValidType(type) {
  return typeof type === "string" && VALID_TYPES.includes(type);
}

function isValidSlug(slug) {
  return typeof slug === "string" && /^[a-zA-Z0-9_-]+$/.test(slug);
}

function getDirForType(type) {
  return path.join(PUBLICATIONS_DIR, type);
}

export function getAllPublications() {
  const publications = [];

  for (const type of VALID_TYPES) {
    const dir = getDirForType(type);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

    for (const filename of files) {
      const filePath = path.resolve(dir, filename);
      if (!filePath.startsWith(PUBLICATIONS_DIR)) continue;

      const fileContent = fs.readFileSync(filePath, "utf8");
      const { frontmatter, content, readingTime } = parseMarkdownFile(fileContent);

      const slug = frontmatter.slug || filename.replace(/\.md$/, "");

      publications.push({
        type: frontmatter.type || type,
        slug,
        title: frontmatter.title || slug,
        date: frontmatter.date || "",
        status: frontmatter.status || "complete",
        summary: frontmatter.summary || frontmatter.excerpt || "",
        domain: frontmatter.domain || "general",
        technologies: frontmatter.technologies || [],
        tags: frontmatter.tags || [],
        effort: frontmatter.effort || "",
        evidence: frontmatter.evidence || [],
        featured: Boolean(frontmatter.featured),
        related: frontmatter.related || [],
        briefing: frontmatter.briefing || {
          objective: frontmatter.objective || frontmatter.summary || "",
          environment: frontmatter.environment || (frontmatter.technologies?.length > 0 ? frontmatter.technologies.slice(0, 5).join(" · ") : frontmatter.domain || "Infrastructure"),
          outcome: frontmatter.outcome || frontmatter.verifiedOutcome || "Verified in isolated lab topology with deterministic test vectors and configuration artifacts.",
        },
        readingTime,
        content,
      });
    }
  }

  return publications.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPublicationsByType(type) {
  if (!isValidType(type)) return [];
  return getAllPublications().filter((p) => p.type === type);
}

export function getPublicationBySlug(type, slug) {
  if (!isValidType(type) || !isValidSlug(slug)) {
    throw new Error(`Invalid publication request: ${type}/${slug}`);
  }

  const dir = getDirForType(type);
  const filePath = path.resolve(dir, `${slug}.md`);

  // Strict path containment check
  if (!filePath.startsWith(PUBLICATIONS_DIR)) {
    throw new Error(`Path traversal blocked: ${type}/${slug}`);
  }

  if (!fs.existsSync(filePath)) {
    // Try scanning filename without strict slug match
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const candidatePath = path.resolve(dir, file);
      if (!candidatePath.startsWith(PUBLICATIONS_DIR)) continue;

      const raw = fs.readFileSync(candidatePath, "utf8");
      const { frontmatter, content, html, readingTime } = parseMarkdownFile(raw);
      if (frontmatter.slug === slug || file.replace(/\.md$/, "") === slug) {
        return {
          type: frontmatter.type || type,
          slug,
          title: frontmatter.title || slug,
          date: frontmatter.date || "",
          status: frontmatter.status || "complete",
          summary: frontmatter.summary || "",
          domain: frontmatter.domain || "general",
          technologies: frontmatter.technologies || [],
          tags: frontmatter.tags || [],
          effort: frontmatter.effort || "",
          evidence: frontmatter.evidence || [],
          related: frontmatter.related || [],
          briefing: frontmatter.briefing || {
            objective: frontmatter.objective || frontmatter.summary || "",
            environment: frontmatter.environment || (frontmatter.technologies?.length > 0 ? frontmatter.technologies.slice(0, 5).join(" · ") : frontmatter.domain || "Infrastructure"),
            outcome: frontmatter.outcome || frontmatter.verifiedOutcome || "Verified in isolated lab topology with deterministic test vectors and configuration artifacts.",
          },
          readingTime,
          content,
          html,
        };
      }
    }
    throw new Error(`Publication not found: ${type}/${slug}`);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const { frontmatter, content, html, readingTime } = parseMarkdownFile(raw);

  return {
    type: frontmatter.type || type,
    slug,
    title: frontmatter.title || slug,
    date: frontmatter.date || "",
    status: frontmatter.status || "complete",
    summary: frontmatter.summary || "",
    domain: frontmatter.domain || "general",
    technologies: frontmatter.technologies || [],
    tags: frontmatter.tags || [],
    effort: frontmatter.effort || "",
    evidence: frontmatter.evidence || [],
    related: frontmatter.related || [],
    briefing: frontmatter.briefing || {
      objective: frontmatter.objective || frontmatter.summary || "",
      environment: frontmatter.environment || (frontmatter.technologies?.length > 0 ? frontmatter.technologies.slice(0, 5).join(" · ") : frontmatter.domain || "Infrastructure"),
      outcome: frontmatter.outcome || frontmatter.verifiedOutcome || "Verified in isolated lab topology with deterministic test vectors and configuration artifacts.",
    },
    readingTime,
    content,
    html,
  };
}

/**
 * Returns { prev, next } publications relative to the given one.
 * Sorted globally by date descending — adjacency crosses types.
 * "prev" = more recent, "next" = older.
 */
export function getAdjacentPublications(currentType, currentSlug) {
  const all = getAllPublications(); // sorted date desc
  const index = all.findIndex(
    (p) => p.type === currentType && p.slug === currentSlug
  );

  if (index === -1) return { prev: null, next: null };

  return {
    prev: index > 0 ? all[index - 1] : null,
    next: index < all.length - 1 ? all[index + 1] : null,
  };
}
