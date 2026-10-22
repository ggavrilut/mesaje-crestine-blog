// The text of an article as a reader sees it, and the word-for-word comparison behind the
// text rule (docs/hard-rules.md). Used by the importer (live page against source.txt) and by
// the build (rendered page against source.txt), so both sides are read the same way.
import type { CheerioAPI } from 'cheerio';
import type { AnyNode } from 'domhandler';

const BLOCK = new Set([
  'p', 'div', 'section', 'article', 'blockquote', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'figure', 'figcaption', 'pre', 'hr', 'table', 'tr',
]);
const SKIP = new Set(['script', 'style', 'iframe', 'noscript', 'svg', 'button', 'template']);

/**
 * The text of the given nodes, one block per paragraph, heading or list item, joined by a
 * blank line; `<br>` becomes a newline. HTML whitespace collapses as a browser does it, but
 * U+00A0 is kept: it is a character of the text. Video facades are not text.
 */
export function blockText($: CheerioAPI, nodes: AnyNode | AnyNode[]): string {
  let out = '';
  const walk = (node: AnyNode) => {
    if (node.type === 'text') {
      out += node.data.replace(/[ \t\r\n\f]+/g, ' ');
      return;
    }
    if (node.type !== 'tag' && node.type !== 'root') return;
    if (node.type === 'tag') {
      if (SKIP.has(node.name) || $(node).hasClass('yt-facade')) return;
      if (node.name === 'br') { out += '\n'; return; }
    }
    const block = node.type === 'tag' && BLOCK.has(node.name);
    if (block) out += '\n\n';
    for (const child of node.children) walk(child);
    if (block) out += '\n\n';
  };
  for (const node of Array.isArray(nodes) ? nodes : [nodes]) walk(node);
  return normaliseBlocks(out);
}

/** Splits on blank lines, trims each block and each line, drops empty blocks. */
export function normaliseBlocks(text: string): string {
  return text
    .split(/\n[ \t]*\n/)
    .map((block) => block.split('\n').map((line) => line.trim()).filter(Boolean).join('\n'))
    .filter((block) => block.trim() !== '')
    .join('\n\n');
}

/** Words split on ASCII whitespace only: paragraph and line breaks may differ, characters not. */
export function words(text: string): string[] {
  return text.split(/[ \t\r\n\f]+/).filter(Boolean);
}

export interface WordDiff {
  index: number;
  expected: string;
  actual: string;
}

/** The first point where two texts differ, with a few words of context; null if identical. */
export function firstDifference(expected: string, actual: string): WordDiff | null {
  const a = words(expected);
  const b = words(actual);
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) {
      return {
        index: i,
        expected: a.slice(Math.max(0, i - 4), i + 6).join(' ') || '(end of text)',
        actual: b.slice(Math.max(0, i - 4), i + 6).join(' ') || '(end of text)',
      };
    }
  }
  return null;
}
