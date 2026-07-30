import fs from "fs";
import path from "path";
import { parseMarkdownFile } from "./content";

const PUBLICATIONS_DIR = path.join(process.cwd(), "content", "publications");

const VALID_TYPES = ["project", "case-study", "lab", "research"];

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
      const filePath = path.join(dir, filename);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const { frontmatter, content } = parseMarkdownFile(fileContent);

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
        content,
      });
    }
  }

  return publications.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPublicationsByType(type) {
  return getAllPublications().filter((p) => p.type === type);
}

export function getPublicationBySlug(type, slug) {
  const dir = getDirForType(type);
  const filePath = path.join(dir, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    // Try scanning filename without strict slug match
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { frontmatter, content, html } = parseMarkdownFile(raw);
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
          content,
          html,
        };
      }
    }
    throw new Error(`Publication not found: ${type}/${slug}`);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const { frontmatter, content, html } = parseMarkdownFile(raw);

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
    content,
    html,
  };
}
