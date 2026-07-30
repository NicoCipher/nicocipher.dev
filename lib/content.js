import matter from "gray-matter";
import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: true,
});

export function parseMarkdownFile(fileContent) {
  const { data, content } = matter(fileContent);
  const html = marked.parse(content);

  return {
    frontmatter: data,
    content,
    html,
  };
}
