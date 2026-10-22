// WordPress HTML to Markdown, for the importer (docs/specs/wordpress-import.md). Formatting
// only: every character of the text comes out as it went in (docs/content-model.md, what
// formatting may do). Only the tags the live site uses are known; anything else throws, so a
// new construct is looked at instead of being dropped.
import type { CheerioAPI } from 'cheerio';
import type { AnyNode, Element } from 'domhandler';

/** A line holding only this URL is a video placed at that point of the text. */
export const youtubeMarker = (id: string) => `https://www.youtube.com/watch?v=${id}`;

type Token =
  | { kind: 'text'; md: string }
  | { kind: 'break' }
  | { kind: 'mark'; tag: 'em' | 'strong'; open: boolean; pair: number };

const INLINE_TAGS: Record<string, 'em' | 'strong' | 'unwrap' | undefined> = {
  em: 'em', i: 'em', strong: 'strong', b: 'strong', span: 'unwrap',
};

const isSpace = (c: string | undefined) => c === undefined || /\s/u.test(c);
const isPunct = (c: string | undefined) => c !== undefined && /[\p{P}\p{S}]/u.test(c);

/** Escapes what Markdown would read as syntax; the rendered text is unchanged. */
function escapeText(text: string): string {
  return text
    .replace(/[\\`*_[\]<>]/g, '\\$&')
    .replace(/&(?=#?[A-Za-z0-9]+;)/g, '\\&');
}

/** Escapes a construct that only means something at the start of a line. */
function escapeLineStart(line: string): string {
  if (/^[-=]+\s*$/.test(line)) return '\\' + line; // setext underline
  return line
    .replace(/^(#{1,6})(?=\s|$)/, '\\$1')
    .replace(/^([+-])(?=\s)/, '\\$1')
    .replace(/^(\d{1,9})([.)])(?=\s|$)/, '$1\\$2');
}

export class UnknownTagError extends Error {}

/** Converts the inline content of one block (a paragraph, heading or list item). */
function inline($: CheerioAPI, el: Element, link: (href: string) => string): string {
  const tokens: Token[] = [];
  let pairs = 0;
  const walk = (node: AnyNode) => {
    if (node.type === 'text') {
      const text = node.data.replace(/[ \t\r\n\f]+/g, ' ');
      if (text) tokens.push({ kind: 'text', md: escapeText(text) });
      return;
    }
    if (node.type === 'comment') return;
    if (node.type !== 'tag') throw new UnknownTagError(`node type ${node.type}`);
    if (node.name === 'br') { tokens.push({ kind: 'break' }); return; }
    if (node.name === 'a') {
      const href = $(node).attr('href') ?? '';
      const label = inline($, node, link);
      const url = link(href);
      tokens.push({ kind: 'text', md: href ? `[${label}](${/[\s()<>]/.test(url) ? `<${url}>` : url})` : label });
      return;
    }
    const role = INLINE_TAGS[node.name];
    if (!role) throw new UnknownTagError(`<${node.name}> inside <${el.name}>`);
    if (role === 'unwrap') { node.children.forEach(walk); return; }
    if (!$(node).text().trim()) { node.children.forEach(walk); return; } // empty <em></em>
    const pair = pairs++;
    tokens.push({ kind: 'mark', tag: role, open: true, pair });
    node.children.forEach(walk);
    tokens.push({ kind: 'mark', tag: role, open: false, pair });
  };
  el.children.forEach(walk);
  return render(tokens);
}

/**
 * Joins the tokens. Whitespace at the inner edge of emphasis moves outside it; `*`/`**` is
 * used where CommonMark's flanking rules let it open and close, `<em>`/`<strong>` elsewhere.
 * Breaks at the edges of the block are dropped: a trailing hard break is not valid Markdown.
 */
function render(tokens: Token[]): string {
  // "<em>a</em><em>b</em>" is one emphasis: "*a**b*" would not parse as two.
  for (let i = 0; i + 1 < tokens.length; i++) {
    const [a, b] = [tokens[i], tokens[i + 1]];
    if (a.kind === 'mark' && b.kind === 'mark' && !a.open && b.open && a.tag === b.tag) {
      const closer = tokens.find((t) => t.kind === 'mark' && !t.open && t.pair === b.pair) as Token & { kind: 'mark' };
      closer.pair = a.pair;
      tokens.splice(i, 2);
      i--;
    }
  }
  // Move edge whitespace out of emphasis: "<em>a </em>b" reads as "*a* b".
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.kind !== 'mark') continue;
    const inner = t.open ? tokens[i + 1] : tokens[i - 1];
    if (inner?.kind !== 'text') continue;
    if (t.open && /^ /.test(inner.md)) {
      inner.md = inner.md.slice(1);
      tokens.splice(i, 0, { kind: 'text', md: ' ' });
      i++;
    } else if (!t.open && / $/.test(inner.md)) {
      inner.md = inner.md.slice(0, -1);
      tokens.splice(i + 1, 0, { kind: 'text', md: ' ' });
    }
  }
  const blank = (t: Token | undefined) => t?.kind === 'break' || (t?.kind === 'text' && !t.md.trim());
  while (blank(tokens[0])) tokens.shift();
  while (blank(tokens.at(-1))) tokens.pop();

  const html = new Set<number>();
  const delim = (t: Token & { kind: 'mark' }) =>
    html.has(t.pair) ? (t.open ? `<${t.tag}>` : `</${t.tag}>`) : t.tag === 'em' ? '*' : '**';
  const piece = (t: Token) => (t.kind === 'text' ? t.md : t.kind === 'break' ? '\\\n' : delim(t));

  // Settle delimiters until no pair changes: a pair that cannot flank becomes HTML.
  for (let changed = true; changed;) {
    changed = false;
    const pieces = tokens.map(piece);
    tokens.forEach((t, i) => {
      if (t.kind !== 'mark' || html.has(t.pair)) return;
      const before = pieces.slice(0, i).join('').at(-1);
      const after = pieces.slice(i + 1).join('')[0];
      const ok = t.open
        ? !isSpace(after) && (!isPunct(after) || isSpace(before) || isPunct(before))
        : !isSpace(before) && (!isPunct(before) || isSpace(after) || isPunct(after));
      if (!ok) { html.add(t.pair); changed = true; }
    });
  }
  return tokens
    .map(piece)
    .join('')
    .split('\n')
    .map((line) => escapeLineStart(line.replace(/^ +/, '')))
    .join('\n')
    .trim();
}

/**
 * Converts block elements to Markdown blocks. `link` rewrites an href (absolute links to the
 * old site become new paths). Video markers pass through as their own block.
 */
export function blocksToMarkdown(
  $: CheerioAPI,
  nodes: AnyNode[],
  link: (href: string) => string = (h) => h,
): string {
  const out: string[] = [];
  const block = (node: AnyNode) => {
    if (node.type === 'text') {
      if (node.data.trim()) throw new UnknownTagError(`loose text "${node.data.trim().slice(0, 40)}"`);
      return;
    }
    if (node.type === 'comment') return;
    if (node.type !== 'tag') throw new UnknownTagError(`node type ${node.type}`);
    const name = node.name;
    if (name === 'p') {
      const md = inline($, node, link);
      if (md.trim()) out.push(md);
    } else if (/^h[1-6]$/.test(name)) {
      const md = inline($, node, link).replace(/\\\n/g, ' ').replace(/(#+)\s*$/, (m) => m.replace(/#/g, '\\#'));
      if (md.trim()) out.push('#'.repeat(Math.max(2, Number(name[1]))) + ' ' + md);
    } else if (name === 'ol' || name === 'ul') {
      const start = Number($(node).attr('start') ?? 1);
      const items = $(node).children('li').toArray();
      if ($(node).children().not('li').length) throw new UnknownTagError(`non-<li> inside <${name}>`);
      out.push(
        items
          .map((li, i) => {
            const marker = name === 'ol' ? `${start + i}. ` : '- ';
            const md = inline($, li, link).replace(/\n/g, '\n' + ' '.repeat(marker.length));
            return marker + md;
          })
          .join('\n'),
      );
    } else if (name === 'div' && $(node).hasClass('yt-marker')) {
      out.push(youtubeMarker($(node).attr('data-id')!));
    } else if (name === 'div') {
      node.children.forEach(block);
    } else {
      throw new UnknownTagError(`<${name}> as a block`);
    }
  };
  nodes.forEach(block);
  return out.join('\n\n') + '\n';
}
