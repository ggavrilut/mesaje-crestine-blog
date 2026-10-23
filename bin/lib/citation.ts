// The citation under a live WordPress post (docs/specs/wordpress-import.md): the Bricks text
// elements between the article (post-content) and the related posts. Each post's template has
// its own element IDs, so they are found by position, not by ID. Converted to the `source`
// format of src/lib/citation.ts: text, `[text](url)` links, line breaks, blank lines.
import type * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';
import { blockText } from '../../src/lib/text.ts';

const BLOCK = new Set(['p', 'div', 'li', 'ul', 'ol', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

/** The citation elements, in page order; empty for a post without one or read from Bricks text elements. */
export function citationElements(page: cheerio.CheerioAPI): AnyNode[] {
  const out: AnyNode[] = [];
  let afterContent = false;
  page('main .bricks-element-post-content, main .bricks-element-text, main .bricks-element-related-posts').each((_, el) => {
    const $el = page(el);
    if ($el.hasClass('bricks-element-post-content')) { afterContent = true; return; }
    if ($el.hasClass('bricks-element-related-posts')) { afterContent = false; return; }
    // Unclosed tags on some pages nest each text element in the previous one: the outermost
    // already holds the rest, so a nested one would repeat it (consistenta, 2026-10-23).
    const nested = out.some((o) => $el.parents().get().includes(o as never));
    if (afterContent && !nested && !$el.closest('.bricks-element-post-content').length && $el.text().trim() && $el.text().trim() !== 'Publicat de') out.push(el);
  });
  return out;
}

/** Whether the citation's text appears, in one piece, in the page's main content: a check
 * independent of the element choice above, which the word-for-word one shares. */
export function citationOnPage(page: cheerio.CheerioAPI, text: string): boolean {
  const squash = (s: string) => s.replace(/\s+/g, '');
  return squash(page('main').text()).includes(squash(text));
}

/** The citation in the `source` format, its links passed through `link` (old post URLs to new). */
export function citationMarkdown(page: cheerio.CheerioAPI, elements: AnyNode[], link: (href: string) => string): string {
  let out = '';
  const walk = (node: AnyNode) => {
    if (node.type === 'text') { out += node.data.replace(/[ \t\r\n\f]+/g, ' '); return; }
    if (node.type !== 'tag') return;
    if (node.name === 'br') { out += '\n'; return; }
    if (node.name === 'script' || node.name === 'style') return;
    if (node.name === 'a' && page(node).attr('href')) {
      const text = page(node).text().replace(/[ \t\r\n\f]+/g, ' ').trim();
      out += text ? `[${text}](${link(page(node).attr('href')!)})` : '';
      return;
    }
    const block = BLOCK.has(node.name);
    if (block) out += '\n\n';
    for (const child of node.children) walk(child);
    if (block) out += '\n\n';
  };
  for (const el of elements) { out += '\n\n'; walk(el); out += '\n\n'; }
  return out
    .split(/\n[ \t]*\n/)
    .map((p) => p.split('\n').map((l) => l.trim()).filter(Boolean).join('\n'))
    .filter(Boolean)
    .join('\n\n');
}

/** The citation's text as the live page shows it, for the word-for-word check. */
export const citationLiveText = (page: cheerio.CheerioAPI, elements: AnyNode[]) => blockText(page, elements);
