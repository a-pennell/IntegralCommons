import { defineConfig } from 'astro/config';

/**
 * Demote all markdown-derived headings by one level (h1→h2, h2→h3, ...).
 * Our Article/Narrative layouts render the page <h1> from frontmatter/title,
 * so markdown source files that start with a top-level "# …" would otherwise
 * produce a second <h1> and break the a11y heading outline.
 */
function rehypeDemoteHeadings() {
  return (tree) => {
    const walk = (node) => {
      if (!node || typeof node !== 'object') return;
      if (node.type === 'element' && /^h[1-5]$/.test(node.tagName)) {
        const level = Number(node.tagName.slice(1));
        node.tagName = `h${level + 1}`;
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) walk(child);
      }
    };
    walk(tree);
  };
}

export default defineConfig({
  output: 'static',
  site: 'https://commonground.page',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  markdown: {
    rehypePlugins: [rehypeDemoteHeadings],
  },
});
