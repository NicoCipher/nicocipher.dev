import matter from "gray-matter";

/**
 * Section templates per publication type.
 * Pre-filled as Markdown headings when creating a new publication.
 */
const SECTION_TEMPLATES = {
  project: [
    "## 1. Objective",
    "",
    "",
    "## 2. Architecture",
    "",
    "",
    "## 3. Key Design Decisions",
    "",
    "",
    "## 4. What Went Wrong",
    "",
    "",
    "## 5. Current State",
    "",
    "",
    "## 6. Permanent Takeaway",
    "",
  ],
  "case-study": [
    "## 1. Objective",
    "",
    "",
    "## 2. Setup & Execution",
    "",
    "",
    "## 3. The Friction Point",
    "",
    "",
    "## 4. Analysis",
    "",
    "",
    "## 5. What Went Wrong",
    "",
    "",
    "## 6. Permanent Takeaway",
    "",
  ],
  lab: [
    "## 1. Objective",
    "",
    "",
    "## 2. Environment Setup",
    "",
    "",
    "## 3. Implementation",
    "",
    "",
    "## 4. The Friction Point",
    "",
    "",
    "## 5. What Went Wrong",
    "",
    "",
    "## 6. Verification",
    "",
    "",
    "## 7. Permanent Takeaway",
    "",
  ],
  research: [
    "## 1. Objective",
    "",
    "",
    "## 2. Analysis",
    "",
    "",
    "## 3. Key Insight",
    "",
    "",
    "## 4. What Went Wrong",
    "",
    "",
    "## 5. Permanent Takeaway",
    "",
  ],
};

/**
 * Generate the default Markdown body for a publication type.
 */
export function getBodyTemplate(type) {
  const template = SECTION_TEMPLATES[type];
  if (!template) return "";
  return template.join("\n");
}

/**
 * Generate a URL-safe slug from a title string.
 */
export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/**
 * Build the canonical file path for a publication.
 */
export function getPublicationPath(type, slug, date) {
  const datePrefix = date || new Date().toISOString().split("T")[0];
  return `content/publications/${type}/${datePrefix}-${slug}.md`;
}

/**
 * Serialize a structured publication object back to a Markdown file string.
 *
 * Input shape:
 *   {
 *     type, title, slug, date, status, domain, summary, effort,
 *     technologies: [], tags: [], featured: bool,
 *     evidence: [{ id, type, title, content, language, src, ... }],
 *     related: [],
 *     body: "markdown string"
 *   }
 *
 * Output: string (YAML frontmatter + Markdown body)
 */
export function serializePublication(pub) {
  const frontmatter = {};

  // Required fields
  frontmatter.type = pub.type || "lab";
  frontmatter.title = pub.title || "Untitled";
  frontmatter.slug = pub.slug || slugify(pub.title || "untitled");
  frontmatter.date = pub.date || new Date().toISOString().split("T")[0];
  frontmatter.status = pub.status || "complete";
  frontmatter.domain = pub.domain || "general";
  frontmatter.summary = pub.summary || "";
  frontmatter.effort = pub.effort || "";

  // Arrays
  if (pub.technologies?.length > 0) {
    frontmatter.technologies = pub.technologies;
  }
  if (pub.tags?.length > 0) {
    frontmatter.tags = pub.tags;
  }

  // Boolean
  if (pub.featured) {
    frontmatter.featured = true;
  }

  // Related
  if (pub.related?.length > 0) {
    frontmatter.related = pub.related;
  }

  // Evidence — serialize with multiline content preserved
  if (pub.evidence?.length > 0) {
    frontmatter.evidence = pub.evidence.map((ev) => {
      const entry = {
        id: ev.id || "",
        type: ev.type || "snippet",
        title: ev.title || "",
      };

      if (ev.content) entry.content = ev.content;
      if (ev.language) entry.language = ev.language;
      if (ev.src) entry.src = ev.src;
      if (ev.caption) entry.caption = ev.caption;
      if (ev.downloadUrl) entry.downloadUrl = ev.downloadUrl;
      if (ev.size) entry.size = ev.size;
      if (ev.checksum) entry.checksum = ev.checksum;

      return entry;
    });
  }

  const body = pub.body || "";

  return matter.stringify(body, frontmatter);
}

/**
 * Parse a Markdown publication file into a structured object.
 * Inverse of serializePublication — uses the same shape.
 */
export function deserializePublication(fileContent) {
  const { data, content } = matter(fileContent);

  return {
    type: data.type || "",
    title: data.title || "",
    slug: data.slug || "",
    date: data.date || "",
    status: data.status || "complete",
    domain: data.domain || "",
    summary: data.summary || "",
    effort: data.effort || "",
    technologies: data.technologies || [],
    tags: data.tags || [],
    featured: Boolean(data.featured),
    related: data.related || [],
    evidence: data.evidence || [],
    body: content.trim(),
  };
}
