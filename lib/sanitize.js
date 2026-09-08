/**
 * Zero-dependency HTML and URL sanitizer for nicocipher.dev.
 * Protects Markdown rendering, live preview, and evidence links
 * against XSS (stored/DOM), protocol injection, and reverse tabnabbing.
 */

// Tags permitted in markdown rendering
const ALLOWED_TAGS = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr",
  "strong", "b", "em", "i", "u", "s", "del", "mark",
  "code", "pre", "blockquote", "kbd", "span", "div",
  "ul", "ol", "li",
  "table", "thead", "tbody", "tr", "th", "td",
  "a", "img", "figure", "figcaption"
]);

// Tags whose contents must be completely destroyed (not even text left over)
const STRIP_TAGS_WITH_CONTENT = ["script", "style", "iframe", "object", "embed", "noscript", "template", "svg"];

// Attributes allowed on specific tags (whitelist)
const ALLOWED_ATTRS = {
  a: new Set(["href", "title", "target", "rel", "aria-label", "download", "class"]),
  img: new Set(["src", "alt", "title", "width", "height", "loading", "class"]),
  div: new Set(["class", "role", "tabindex", "aria-label"]),
  code: new Set(["class"]),
  span: new Set(["class", "aria-hidden", "style"]),
  td: new Set(["align", "class"]),
  th: new Set(["align", "class"]),
  table: new Set(["class", "role", "tabindex", "aria-label"]),
  figure: new Set(["class"]),
  figcaption: new Set(["class"]),
  pre: new Set(["class", "tabindex", "aria-label"]),
};

// Safe protocols for URLs
const SAFE_PROTOCOL_REGEX = /^(https?:|mailto:|#|\/|\.\/)/i;
const DANGEROUS_SCHEME_REGEX = /^\s*(javascript|data|vbscript):/i;

/**
 * Sanitize a URL value for href, src, or downloadUrl.
 * Replaces dangerous schemes (javascript:, data:, vbscript:) with a safe fallback.
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (DANGEROUS_SCHEME_REGEX.test(trimmed)) {
    return "#blocked-unsafe-protocol";
  }
  if (!SAFE_PROTOCOL_REGEX.test(trimmed) && !trimmed.startsWith("/")) {
    // Relative link without protocol or anchor
    if (/^[a-zA-Z0-9_\-./?&=%#]+$/.test(trimmed)) {
      return trimmed;
    }
    return "#blocked-unsafe-url";
  }
  return trimmed;
}

/**
 * Sanitize an HTML string produced by marked or user input.
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== "string") return "";

  let cleaned = html;

  // 1. Strip dangerous tags AND their inner contents (e.g. <script>...</script>)
  for (const tag of STRIP_TAGS_WITH_CONTENT) {
    const regex = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi");
    cleaned = cleaned.replace(regex, "");
    // Also remove any self-closing or unclosed instances
    const selfClosing = new RegExp(`<${tag}\\b[^>]*\\/?>`, "gi");
    cleaned = cleaned.replace(selfClosing, "");
  }

  // 2. Parse and filter all remaining HTML tags
  cleaned = cleaned.replace(/<\/?([a-zA-Z0-9_-]+)([^>]*)>/g, (match, tagName, attrString) => {
    const lowerTag = tagName.toLowerCase();

    // Closing tag
    if (match.startsWith("</")) {
      return ALLOWED_TAGS.has(lowerTag) ? `</${lowerTag}>` : "";
    }

    // Opening or self-closing tag: if not allowed, strip it
    if (!ALLOWED_TAGS.has(lowerTag)) {
      return "";
    }

    // Filter attributes
    const allowedForTag = ALLOWED_ATTRS[lowerTag] || new Set(["class"]);
    const isSelfClosing = match.endsWith("/>");

    // Match attributes: name="value", name='value', or name=value
    const attrRegex = /([a-zA-Z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let safeAttrs = "";
    let attrMatch;

    while ((attrMatch = attrRegex.exec(attrString)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      let attrVal = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? "";

      // Reject all event handlers (on*)
      if (attrName.startsWith("on")) continue;

      // Check against tag attribute whitelist
      if (!allowedForTag.has(attrName)) continue;

      // Validate URL attributes
      if (attrName === "href" || attrName === "src") {
        attrVal = sanitizeUrl(attrVal);
      }

      // If safe, re-encode value to prevent attribute breakout
      const escapedVal = attrVal
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      safeAttrs += ` ${attrName}="${escapedVal}"`;
    }

    // Automatically enforce safe external links and anti-tabnabbing
    if (lowerTag === "a") {
      const isExternal = /href="https?:\/\//i.test(safeAttrs);
      const isBlank = /target="_blank"/i.test(safeAttrs);

      if (isExternal || isBlank) {
        if (!safeAttrs.includes("target=")) {
          safeAttrs += ' target="_blank"';
        }
        if (!safeAttrs.includes("rel=")) {
          safeAttrs += ' rel="noopener noreferrer"';
        } else {
          // Ensure existing rel includes both noopener and noreferrer
          safeAttrs = safeAttrs.replace(/rel="([^"]*)"/i, (match, val) => {
            const rels = new Set(val.split(/\s+/).filter(Boolean));
            rels.add("noopener");
            rels.add("noreferrer");
            return `rel="${Array.from(rels).join(" ")}"`;
          });
        }
      }
    }

    return `<${lowerTag}${safeAttrs}${isSelfClosing ? " /" : ""}>`;
  });

  return cleaned;
}

/**
 * Safely serialize an object for embedding within <script type="application/ld+json">.
 * Escapes <, >, and & as Unicode escape sequences to prevent script block breakout
 * and HTML parser manipulation.
 */
export function safeJsonLd(obj) {
  if (!obj) return "{}";
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
