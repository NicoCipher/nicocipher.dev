/**
 * Pure client-safe search scoring function.
 * No Node.js imports — safe to use in "use client" components.
 *
 * Scoring:
 *   +10  exact title match
 *   +6   title starts with query
 *   +4   title contains query
 *   +4   tag exact match
 *   +2   tag contains query
 *   +3   technology match
 *   +2   domain match
 *   +2   excerpt match
 *   +2   type/typeLabel match
 *   +1   evidence type match
 */
export function searchIndex(index, rawQuery, maxResults = 10) {
  const raw = rawQuery.trim().toLowerCase();
  
  // Empty query: surface curated quick actions and primary pages
  if (!raw) {
    const defaultActions = index.filter((item) => item.kind === "quick-action").slice(0, 5);
    const defaultPages = index.filter((item) => item.kind === "page").slice(0, 3);
    return { results: [...defaultActions, ...defaultPages], query: "" };
  }

  const isActionOnly = raw.startsWith(">");
  const q = isActionOnly ? raw.slice(1).trim() : raw;

  if (isActionOnly && !q) {
    const allActions = index.filter((item) => item.kind === "quick-action");
    return { results: allActions, query: ">" };
  }

  const scored = [];

  for (const item of index) {
    if (isActionOnly && item.kind !== "quick-action") continue;

    let score = 0;
    const title = (item.title || "").toLowerCase();

    if (title === q) score += 10;
    else if (title.startsWith(q)) score += 6;
    else if (title.includes(q)) score += 4;

    if (item.shortcut && item.shortcut.toLowerCase() === q) score += 8;

    const tags = item.tags || [];
    if (tags.some((t) => t.toLowerCase() === q)) score += 4;
    else if (tags.some((t) => t.toLowerCase().includes(q))) score += 2;

    const techs = item.technologies || [];
    if (techs.some((t) => t.toLowerCase().includes(q))) score += 3;

    if ((item.domain || "").toLowerCase().includes(q)) score += 2;
    if ((item.excerpt || "").toLowerCase().includes(q)) score += 2;
    if ((item.type || "").toLowerCase().includes(q)) score += 2;
    if ((item.typeLabel || "").toLowerCase().includes(q)) score += 2;

    const evidenceTypes = item.evidenceTypes || [];
    if (evidenceTypes.some((t) => t.toLowerCase().includes(q))) score += 1;

    if (item.kind === "quick-action" && score > 0) score += 2;

    if (score > 0) scored.push({ item, score });
  }

  scored.sort((a, b) => b.score - a.score);

  return {
    results: scored.slice(0, maxResults).map((s) => s.item),
    query: q,
  };
}
