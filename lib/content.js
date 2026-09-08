import matter from "gray-matter";
import { marked } from "marked";
import { sanitizeHtml } from "./sanitize";

marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Calculate reading time in minutes.
 * 200 wpm for technical content (slower than standard 250 wpm).
 */
export function calculateReadingTime(text) {
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

export function parseMarkdownFile(fileContent) {
  const { data, content } = matter(fileContent);
  let html = marked.parse(content);

  // Wrap tables in accessible, keyboard-scrollable container
  html = html
    .replace(/<table(\s[^>]*)?>/g, '<div class="table-wrapper" role="region" tabindex="0" aria-label="Data table"><table$1>')
    .replace(/<\/table>/g, '</table></div>');

  // Sanitize HTML output to eliminate XSS vectors, strip forbidden tags/handlers, and enforce noopener noreferrer
  html = sanitizeHtml(html);

  const readingTime = calculateReadingTime(content);

  return {
    frontmatter: data,
    content,
    html,
    readingTime,
  };
}
