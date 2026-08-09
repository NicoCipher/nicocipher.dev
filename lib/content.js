import matter from "gray-matter";
import { marked } from "marked";

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
  const html = marked.parse(content);
  const readingTime = calculateReadingTime(content);

  return {
    frontmatter: data,
    content,
    html,
    readingTime,
  };
}
