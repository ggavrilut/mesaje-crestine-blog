import { getCollection, type CollectionEntry } from 'astro:content';

export const SITE_NAME = 'Mesaje Creștine';
export const SITE_URL = 'https://mesaje-crestine.ro';
export const PER_PAGE = 10;
export const FACEBOOK_URL = 'https://www.facebook.com/Mesaje-Cre%C8%99tine-100365085780276';

// The verses of the home band and the footer (docs/specs/visual-design.md): change them here.
export const HERO_VERSE = {
  text: 'Vegheați dar, rugându‐vă în orice vreme, ca să fiți socotiți vrednici să scăpați de toate acestea care au să fie și să stați înaintea Fiului omului.',
  reference: 'Luca 21:36',
  version: 'VDCL 31',
};
export const FOOTER_VERSE = {
  text: 'Căutați mai întâi Împărăția lui Dumnezeu și dreptatea Lui, și toate aceste lucruri vi se vor da pe deasupra.',
  reference: 'Matei 6:33',
};

export type Post = CollectionEntry<'posts'>;
export type Author = CollectionEntry<'authors'>;

export const absolute = (path: string) => new URL(path, SITE_URL).href;
export const postPath = (post: Post) => `/${post.id}/`;
/** The post's PDF, served next to its page by src/pages/[slug]/[pdf].ts. */
export const pdfPath = (post: Post) => post.data.pdf && `/${post.id}/${post.data.pdf.slice(2)}`;
export const authorPath = (author: Author) => `/authors/${author.id}/`;

/** `{title} | Mesaje Creștine`, or without the brand (or the `seoTitle`) past about 60 characters (docs/seo.md). */
export function pageTitle(title: string, seoTitle?: string): string {
  const full = `${title} | ${SITE_NAME}`;
  if (full.length <= 60) return full;
  return seoTitle ?? title;
}

/** Published posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', (p) => !p.data.draft);
  for (const p of posts) {
    if (p.data.slug !== p.id) throw new Error(`content/posts/${p.id}: slug "${p.data.slug}" must equal the folder name`);
  }
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id));
}

export async function getAuthors(): Promise<Map<string, Author>> {
  const authors = await getCollection('authors');
  return new Map(authors.map((a) => [a.id, a]));
}

export const authorsOf = (post: Post, authors: Map<string, Author>) =>
  post.data.author.map((ref) => {
    const author = authors.get(ref.id);
    if (!author) throw new Error(`content/posts/${post.id}: no author "${ref.id}" in content/authors/`);
    return author;
  });

/** The post's `related`, topped up to three with the same author's newest posts, then the newest overall. */
export function relatedPosts(post: Post, all: Post[]): Post[] {
  const byId = new Map(all.map((p) => [p.id, p]));
  const out = post.data.related.map((r) => byId.get(r.id)).filter((p): p is Post => !!p);
  const authorIds = new Set(post.data.author.map((a) => a.id));
  const sameAuthor = all.filter((p) => p.data.author.some((a) => authorIds.has(a.id)));
  for (const p of [...sameAuthor, ...all]) {
    if (out.length >= 3) break;
    if (p.id !== post.id && !out.includes(p)) out.push(p);
  }
  return out;
}

/**
 * The article's first `count` words followed by `…`, for lists. Only Markdown markup and the
 * comma or colon before the cut are removed; the words themselves are the article's.
 */
export function excerpt(post: Post, count: number): string {
  const text = (post.body ?? '')
    .split('\n')
    .filter((line) => !/^\s*https?:\/\/\S+\s*$/.test(line) && !/^\s*!\[/.test(line))
    .map((line) => line.replace(/^\s*(>\s*)*(#{1,6}\s|[-+*]\s|\d+\.\s)?/, ''))
    .join(' ')
    .replace(/<\/?[a-z][^>]*>/gi, '')
    .replace(/(?<!\\)(\*{1,3}|_{1,3})(?=\S)|(?<=\S)(?<!\\)(\*{1,3}|_{1,3})/g, '')
    .replace(/\\([\\`*_{}[\]()#+\-.!>])/g, '$1');
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= count) return words.join(' ');
  return `${words.slice(0, count).join(' ').replace(/[,;:–-]+$/, '')}…`;
}

/** The posts published just before (older) and just after (newer) this one. */
export function neighbours(post: Post, all: Post[]): { older?: Post; newer?: Post } {
  const i = all.indexOf(post);
  return { older: all[i + 1], newer: i > 0 ? all[i - 1] : undefined };
}

/** Archive pages with fewer than two posts are not indexed (docs/seo.md). */
export const indexable = (postCount: number) => postCount >= 2;

/**
 * Turnstile site key, public (it ships in every page; docs/architecture.md, contact form).
 * Local tests build with Cloudflare's test key in PUBLIC_TURNSTILE_SITE_KEY.
 */
export const TURNSTILE_SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAAFhL6pcNmP1n77El';
