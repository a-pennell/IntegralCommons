import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

type Schema = typeof defaultSchema;

/**
 * Markdown pipeline — parse → convert to HTML → sanitize with a conservative
 * allowlist → stringify.
 *
 * Phase 1 rule: plain Markdown only. No inline HTML, no images with `src`
 * schemes other than https, no iframes, no scripts, no style attributes.
 */

const sanitizeSchema: Schema = {
  ...defaultSchema,
  tagNames: [
    'p',
    'br',
    'em',
    'strong',
    'code',
    'pre',
    'blockquote',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'a',
    'hr',
    'del',
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), ['rel', 'nofollow', 'ugc', 'noopener']],
  },
  protocols: {
    href: ['http', 'https', 'mailto'],
  },
  clobberPrefix: 'user-content-',
};

const pipeline = remark()
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeStringify);

/**
 * Render user-supplied Markdown to safe HTML.
 * All bodies passing through this function are safe for insertion via
 * `dangerouslySetInnerHTML` — but prefer server-rendering a React tree
 * when possible.
 */
export async function renderMarkdown(md: string): Promise<string> {
  const file = await pipeline.process(md);
  return String(file);
}
