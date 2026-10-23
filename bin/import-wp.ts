// Imports the live WordPress site into content/ (docs/specs/wordpress-import.md).
// Reads public endpoints only, never writes to WordPress. Run: node bin/import-wp.ts
// Writes content/posts/<slug>/{index.md,source.txt,cover.*}, content/authors/<slug>.{md,*},
// import/report.md, import/legacy-urls.txt and import/redirects.tsv. Running it again gives
// the same files, and keeps what the post writer added to an imported post's front matter
// (description, related, seoTitle).
import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { blocksToMarkdown, UnknownTagError } from './lib/wp-markdown.ts';
import { isBricksPage, liveText } from './lib/live-text.ts';
import { citationElements, citationLiveText, citationMarkdown, citationOnPage } from './lib/citation.ts';
import { blockText, firstDifference, normaliseBlocks, words } from '../src/lib/text.ts';
import { citationText } from '../src/lib/citation.ts';
import { isoBucharest } from '../src/lib/dates.ts';

const SITE = 'https://mesaje-crestine.ro';
const API = `${SITE}/wp-json/wp/v2`;
const RESERVED = new Set(['blog', 'authors', 'page', 'contact', 'despre-noi', 'rss.xml', '404', 'cautare']);
const ROOT = new URL('..', import.meta.url).pathname;
// Author portraits in the media library, by media ID: WordPress links no image to an author
// term, so the owner's choice (2026-10-22) is mapped by hand. `position` is the crop for the
// round avatar (sharp's gravity or strategy), set where the default `attention` cuts the face.
const PORTRAITS: Record<string, { media: number; position?: string }> = {
  'a-b-simpson': { media: 781 },
  'a-n-groves': { media: 754 },
  'alexander-maclaren': { media: 913 },
  'andrew-murray': { media: 513 },
  'christian-chen': { media: 126 },
  'george-muller': { media: 110 },
  'hudson-taylor': { media: 109 },
  'j-wilbur-chapman': { media: 108 },
  'lance-lambert': { media: 804 },
  'lilias-trotter': { media: 514, position: 'top' },
  'paris-reidhead': { media: 127 },
  'stephen-kaung': { media: 122 },
  't-austin-sparks': { media: 124 },
  'watchman-nee': { media: 119 },
};

interface WpPost {
  id: number; date_gmt: string; modified_gmt: string; slug: string; link: string; status: string;
  title: { rendered: string }; content: { rendered: string };
  featured_media: number; author_taxonomy: number[];
}
interface WpMedia {
  id: number; source_url: string; mime_type: string; post: number | null; alt_text: string;
  media_details: { width?: number; height?: number };
}
interface WpTerm { id: number; slug: string; name: string; description: string }

const report: string[] = [];
const note = (line = '') => report.push(line);

async function get(url: string, attempt = 1): Promise<Response> {
  const res = await fetch(url, { headers: { 'user-agent': 'mesaje-crestine-importer (read-only)' } });
  if (res.ok) return res;
  if (attempt < 3 && res.status >= 500) return get(url, attempt + 1);
  throw new Error(`GET ${url}: ${res.status}`);
}

async function all<T>(type: string): Promise<T[]> {
  const out: T[] = [];
  for (let page = 1; ; page++) {
    const res = await get(`${API}/${type}?per_page=100&page=${page}&orderby=id&order=asc`);
    out.push(...((await res.json()) as T[]));
    if (page >= Number(res.headers.get('x-wp-totalpages') ?? 1)) return out;
  }
}

/** Runs `fn` over `items`, `limit` at a time, keeping the input order in the result. */
async function pool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (next < items.length) { const i = next++; out[i] = await fn(items[i]); }
    }),
  );
  return out;
}

/** Every URL of the old sitemap index and its child sitemaps. */
async function sitemapUrls(url: string): Promise<string[]> {
  const xml = await (await get(url)).text();
  const locs = [...xml.matchAll(/<loc>(?:<!\[CDATA\[)?\s*([^<\]]+?)\s*(?:\]\]>)?<\/loc>/g)].map((m) => m[1]);
  if (/<sitemapindex/.test(xml)) return (await Promise.all(locs.map(sitemapUrls))).flat();
  const images = [...xml.matchAll(/<image:loc>(?:<!\[CDATA\[)?\s*([^<\]]+?)\s*(?:\]\]>)?<\/image:loc>/g)].map((m) => m[1]);
  return [...locs, ...images];
}

/** WordPress's `date_gmt` (UTC, no zone) as ISO with the Bucharest offset. */
const bucharest = (utc: string) => isoBucharest(new Date(utc + 'Z'));

const decode = (html: string) => cheerio.load(html, null, false).text();
const path = (url: string) => new URL(url, SITE).pathname;
const yaml = (value: unknown) => JSON.stringify(value); // JSON scalars and arrays are valid YAML
/** A slug from a Romanian title (`seo.md`, URLs): diacritics dropped, lowercase words joined by hyphens. */
const slugify = (title: string) => title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Old post links inside the text point at the new URL; everything else is kept. */
function linkRewriter(slugs: Set<string>) {
  return (href: string) => {
    const m = href.match(/^https?:\/\/(?:www\.)?mesaje-crestine\.ro\/\d{4}\/\d{2}\/([^/]+)\/?$/);
    return m && slugs.has(m[1]) ? `/${m[1]}/` : href;
  };
}

interface Body { nodes: AnyNode[]; $: cheerio.CheerioAPI; notes: string[]; videos: string[] }

/** The article as WordPress's editor stored it. */
function restBody(post: WpPost): Body {
  const $ = cheerio.load(post.content.rendered, null, false);
  return { $, nodes: $.root().contents().toArray(), notes: [], videos: [] };
}

/**
 * The article as the Bricks template renders it, for posts whose REST content is empty:
 * the text and video elements of <main>, in page order. "Publicat de" is the template's label
 * for the WordPress user, not text.
 */
function bricksBody(page: cheerio.CheerioAPI): Body {
  let html = '';
  const notes: string[] = [];
  const videos: string[] = [];
  page('main .bricks-element-text, main .bricks-element-video').each((_, el) => {
    const $el = page(el);
    if ($el.hasClass('bricks-element-video')) {
      const options = JSON.parse($el.find('[data-bricks-video-options]').attr('data-bricks-video-options') ?? '{}');
      const src = $el.find('iframe').attr('data-src') ?? $el.find('iframe').attr('src') ?? '';
      const id: string | undefined = options.youTubeId ?? src.match(/youtube\.com\/embed\/([\w-]{11})/)?.[1];
      if (!id) throw new Error(`video element without a YouTube id: ${$el.html()?.slice(0, 200)}`);
      videos.push(id);
      html += `<div class="yt-marker" data-id="${id}"></div>`;
      return;
    }
    const wrapper = $el.find('.text-wrapper');
    const text = wrapper.text().trim();
    if (text === 'Publicat de') { notes.push('dropped the template label "Publicat de"'); return; }
    if (/^(Editat|Tradus|Traducere|Sursa)/i.test(text)) notes.push(`kept the credit line "${text}" as text`);
    html += wrapper.html() ?? '';
  });
  const $ = cheerio.load(html, null, false);
  return { $, nodes: $.root().contents().toArray(), notes, videos };
}

/**
 * The text elements above the article (between the post meta and the post content). Only one
 * kind is known: a link to the article as a PDF (o-mantuire-asa-de-mare), returned as its URL;
 * anything else is returned as text, for the report.
 */
function aboveArticle(page: cheerio.CheerioAPI): { pdf?: string; unknown: string[] } {
  const out: { pdf?: string; unknown: string[] } = { unknown: [] };
  let before = true;
  page('main .bricks-element-post-content, main .bricks-element-text').each((_, el) => {
    const $el = page(el);
    if ($el.hasClass('bricks-element-post-content')) { before = false; return; }
    if (!before || !$el.text().trim()) return;
    const links = $el.find('a[href]');
    const href = links.attr('href') ?? '';
    if (links.length === 1 && /\/wp-content\/uploads\/.+\.pdf$/i.test(href) && links.text().trim() === $el.text().trim()) out.pdf = href;
    else out.unknown.push($el.text().trim().replace(/\s+/g, ' ').slice(0, 80));
  });
  return out;
}

async function main() {
  const [posts, media, terms, pages] = await Promise.all([
    all<WpPost>('posts'), all<WpMedia>('media'), all<WpTerm>('author_taxonomy'), all<WpPost>('pages'),
  ]);
  const legacy = [...new Set(await sitemapUrls(`${SITE}/sitemap.xml`))].sort();
  const mediaById = new Map(media.map((m) => [m.id, m]));
  const termById = new Map(terms.map((t) => [t.id, t]));
  const published = posts.filter((p) => p.status === 'publish').sort((a, b) => a.date_gmt.localeCompare(b.date_gmt) || a.slug.localeCompare(b.slug));
  const slugs = new Set(published.map((p) => p.slug));
  const link = linkRewriter(slugs);

  for (const p of published) {
    if (RESERVED.has(p.slug)) throw new Error(`post slug "${p.slug}" collides with a site page`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) throw new Error(`post slug "${p.slug}" is not lowercase ASCII with hyphens`);
  }

  console.log(`posts ${published.length}, media ${media.length}, author terms ${terms.length}, pages ${pages.length}, sitemap URLs ${legacy.length}`);
  const html = await pool(published, 4, async (p) => (await get(p.link)).text());

  const rows: string[] = [];
  const problems: string[] = [];
  const usedMedia = new Set<number>();
  const usedAuthors = new Map<string, WpTerm>();
  const diffs: string[] = [];
  const unassigned: string[] = [];
  const noCover: string[] = [];
  const narrowCover: string[] = [];
  const coverUsers = new Map<number, WpPost[]>();
  const portraitRedirects: string[] = [];
  const bricksNotes: string[] = [];
  const citations: string[] = [];
  const citationUploads: string[] = [];
  const pdfRedirects: string[] = [];

  await pool(published.map((p, i) => [p, i] as const), 4, async ([p, i]) => {
    const dir = `${ROOT}content/posts/${p.slug}`;
    await mkdir(dir, { recursive: true });
    const page = cheerio.load(html[i]);
    // The page decides: a post-content element renders the REST content; without one, the
    // template's own text elements are the article (and the REST content may be partial).
    const bricks = isBricksPage(page);
    const body = bricks ? bricksBody(page) : restBody(p);
    if (bricks) {
      const rest = restBody(p);
      const restText = blockText(rest.$, rest.nodes);
      const restNote = !restText ? 'REST content empty' : firstDifference(restText, blockText(body.$, body.nodes)) ? `REST content differs from the page (${words(restText).length} words); the page is imported` : 'REST content equals the page';
      bricksNotes.push(`- \`${p.slug}\`: ${[restNote, ...body.notes, body.videos.length ? `${body.videos.length} video(s): ${body.videos.join(', ')}` : ''].filter(Boolean).join('; ')}`);
    }

    let markdown: string;
    try {
      markdown = blocksToMarkdown(body.$, body.nodes, link);
    } catch (e) {
      if (e instanceof UnknownTagError) { problems.push(`- \`${p.slug}\`: ${e.message}`); return; }
      throw e;
    }
    const source = blockText(body.$, body.nodes);
    if (!source.trim()) problems.push(`- \`${p.slug}\`: empty text after import`);
    const diff = firstDifference(liveText(page, bricks), source);
    if (diff) diffs.push(`- \`${p.slug}\`, word ${diff.index}: live "${diff.expected}" / imported "${diff.actual}"`);

    // The citation under the article: stored as `source`, checked word for word against the page.
    const citationEls = bricks ? [] : citationElements(page);
    const citation = citationEls.length ? citationMarkdown(page, citationEls, link) : '';
    if (citation) {
      citations.push(p.slug);
      const citationDiff = firstDifference(citationLiveText(page, citationEls), normaliseBlocks(citationText(citation)));
      if (citationDiff) diffs.push(`- \`${p.slug}\` citation, word ${citationDiff.index}: live "${citationDiff.expected}" / imported "${citationDiff.actual}"`);
      if (!citationOnPage(page, citationText(citation))) diffs.push(`- \`${p.slug}\` citation: not found in one piece on the page`);
      for (const m of citation.matchAll(/\]\((https?:\/\/(?:www\.)?mesaje-crestine\.ro\/wp-content\/[^)]+)\)/g)) citationUploads.push(`- \`${p.slug}\`: ${path(m[1])}`);
    }

    // A PDF of the article linked above it: kept in the post folder as `pdf`, its old URL redirected.
    const above = bricks ? { unknown: [] } : aboveArticle(page);
    for (const text of above.unknown) problems.push(`- \`${p.slug}\`: unknown element above the article, not imported: "${text}"`);
    let pdf = '';
    if (above.pdf) {
      const name = path(above.pdf).split('/').pop()!.toLowerCase();
      pdf = `./${name}`;
      await writeFile(`${dir}/${name}`, new Uint8Array(await (await get(above.pdf)).arrayBuffer()));
      pdfRedirects.push(`${path(above.pdf)}\t/${p.slug}/${name}`);
      const m = media.find((x) => x.source_url === above.pdf);
      if (m) usedMedia.add(m.id);
    }

    // What the post writer added since the last import survives a new import.
    const kept = existsSync(`${dir}/index.md`) ? await readFile(`${dir}/index.md`, 'utf8') : '';
    const keep = (key: string, empty: string) => {
      const line = kept.match(new RegExp(`^${key}: .*$`, 'm'))?.[0];
      return line && line !== `${key}: ${empty}` ? line : undefined;
    };

    const authors = p.author_taxonomy.map((id) => termById.get(id)!).filter(Boolean);
    authors.forEach((t) => usedAuthors.set(t.slug, t));
    if (!authors.length) unassigned.push(`- \`${p.slug}\` (${p.link})`);

    let cover = '';
    const m = mediaById.get(p.featured_media);
    if (m) {
      usedMedia.add(m.id);
      coverUsers.set(m.id, [...(coverUsers.get(m.id) ?? []), p]);
      const ext = m.source_url.split('.').pop()!.toLowerCase();
      cover = `./cover.${ext}`;
      const bytes = new Uint8Array(await (await get(m.source_url)).arrayBuffer());
      await writeFile(`${dir}/cover.${ext}`, bytes);
      if ((m.media_details.width ?? 0) < 1200) narrowCover.push(`- \`${p.slug}\`: ${m.media_details.width} px`);
    } else {
      noCover.push(`- \`${p.slug}\``);
    }

    const date = bucharest(p.date_gmt);
    // An edit within a day of publishing is part of publishing, not an update.
    const updated = Date.parse(p.modified_gmt + 'Z') - Date.parse(p.date_gmt + 'Z') > 86_400_000 ? bucharest(p.modified_gmt) : '';
    const front = [
      '---',
      `title: ${yaml(decode(p.title.rendered))}`,
      `slug: ${p.slug}`,
      ...[keep('seoTitle', '""')].filter((l): l is string => !!l),
      keep('description', '""') ?? `description: ""`,
      `date: ${yaml(date)}`,
      ...(updated ? [`updated: ${yaml(updated)}`] : []),
      `author: ${yaml(authors.map((t) => t.slug))}`,
      ...(cover ? [`cover: ${cover}`, `coverAlt: ${yaml(m!.alt_text.trim())}`] : []),
      keep('related', '[]') ?? `related: []`,
      ...(citation ? [`source: ${yaml(citation)}`] : []),
      ...(pdf ? [`pdf: ${pdf}`] : []),
      `legacyUrl: ${p.link}`,
      ...(authors.length ? [] : ['draft: true']),
      '---',
      '',
    ].join('\n');
    await writeFile(`${dir}/index.md`, front + markdown);
    await writeFile(`${dir}/source.txt`, source + '\n');
    rows.push(p.slug);
  });

  // The three quotes (`/quote/<x>/`): not in the REST API, read from their pages; each becomes a
  // post whose text is the quote (owner, 2026-10-23). The page title holds "<title> – <author>".
  const quoteSlugs: string[] = [];
  for (const url of legacy.filter((u) => /\/quote\/[^/]+\/$/.test(u))) {
    const page = cheerio.load(await (await get(url)).text());
    const full = (page('meta[property="og:title"]').attr('content') ?? '').replace(/ - Mesaje Creștine$/, '');
    const cut = full.lastIndexOf(' – ');
    const [title, authorName] = cut > 0 ? [full.slice(0, cut), full.slice(cut + 3)] : [full, ''];
    const term = terms.find((t) => decode(t.name) === authorName);
    if (!term) { problems.push(`- quote ${path(url)}: author "${authorName}" is not an author term`); continue; }
    usedAuthors.set(term.slug, term);
    const slug = slugify(title);
    if (slugs.has(slug) || RESERVED.has(slug)) throw new Error(`quote slug "${slug}" collides`);
    const nodes = page('main.bricks-quote-wrapper').children().toArray();
    const markdown = blocksToMarkdown(page, nodes, link);
    const source = blockText(page, nodes);
    const diff = firstDifference(liveText(page, true), source);
    if (!source.trim()) problems.push(`- quote ${path(url)}: empty text`);
    if (diff) diffs.push(`- \`${slug}\` (quote), word ${diff.index}: live "${diff.expected}" / imported "${diff.actual}"`);
    const dir = `${ROOT}content/posts/${slug}`;
    await mkdir(dir, { recursive: true });
    const kept = existsSync(`${dir}/index.md`) ? await readFile(`${dir}/index.md`, 'utf8') : '';
    const keep = (key: string, empty: string) => {
      const line = kept.match(new RegExp(`^${key}: .*$`, 'm'))?.[0];
      return line && line !== `${key}: ${empty}` ? line : undefined;
    };
    const publishedAt = page('meta[property="article:published_time"]').attr('content')!;
    const front = [
      '---',
      `title: ${yaml(title)}`,
      `slug: ${slug}`,
      ...[keep('seoTitle', '""')].filter((l): l is string => !!l),
      keep('description', '""') ?? `description: ""`,
      `date: ${yaml(isoBucharest(new Date(publishedAt)))}`,
      `author: ${yaml([term.slug])}`,
      keep('related', '[]') ?? `related: []`,
      `legacyUrl: ${url}`,
      '---',
      '',
    ].join('\n');
    await writeFile(`${dir}/index.md`, front + markdown);
    await writeFile(`${dir}/source.txt`, source + '\n');
    quoteSlugs.push(slug);
  }

  await mkdir(`${ROOT}content/authors`, { recursive: true });
  // Every author term gets a page, with posts or not (owner, 2026-10-23; noindex below two posts).
  for (const t of [...terms].sort((a, b) => a.slug.localeCompare(b.slug))) {
    const name = decode(t.name);
    const lines = [`name: ${yaml(name)}`, `slug: ${t.slug}`];
    const portrait = PORTRAITS[t.slug];
    const m = portrait && mediaById.get(portrait.media);
    if (portrait && !m) problems.push(`- author \`${t.slug}\`: portrait media ${portrait.media} is not in the media library`);
    if (portrait && m) {
      usedMedia.add(m.id);
      const ext = m.source_url.split('.').pop()!.toLowerCase();
      await writeFile(`${ROOT}content/authors/${t.slug}.${ext}`, new Uint8Array(await (await get(m.source_url)).arrayBuffer()));
      portraitRedirects.push(`${path(m.source_url)}\t/authors/${t.slug}/`);
      lines.push(`image: ./${t.slug}.${ext}`, `imageAlt: ${yaml(name)}`, `imagePosition: ${portrait.position ?? 'attention'}`);
    }
    await writeFile(`${ROOT}content/authors/${t.slug}.md`, `---\n${lines.join('\n')}\n---\n`);
  }
  for (const slug of Object.keys(PORTRAITS)) {
    if (!terms.some((t) => t.slug === slug)) problems.push(`- author \`${slug}\`: has a portrait but no author term`);
  }

  // Redirects that are not posts (those come from each post's legacyUrl at build).
  const redirects = [
    ...pdfRedirects,
    ...portraitRedirects,
    // An old cover image goes to its post (specs/wordpress-import.md, remaining old URLs): the
    // post WordPress attached it to if that post uses it, else the first post that did.
    ...[...coverUsers].map(([id, users]) => {
      const m = mediaById.get(id)!;
      const first = users.sort((a, b) => a.date_gmt.localeCompare(b.date_gmt) || a.slug.localeCompare(b.slug))[0];
      return `${path(m.source_url)}\t/${(users.find((u) => u.id === m.post) ?? first).slug}/`;
    }),
  ].sort();
  await mkdir(`${ROOT}import`, { recursive: true });
  await writeFile(`${ROOT}import/redirects.tsv`, '# old path<TAB>new path, written by bin/import-wp.ts\n' + redirects.join('\n') + '\n');
  await writeFile(`${ROOT}import/legacy-urls.txt`, legacy.join('\n') + '\n');

  const known = new Set([...published.map((p) => p.slug), ...quoteSlugs]);
  const stale = (await readdir(`${ROOT}content/posts`)).filter(
    (s) => !known.has(s) && existsSync(`${ROOT}content/posts/${s}/index.md`),
  );
  const staleImported: string[] = [];
  for (const s of stale) {
    if (/^legacyUrl:/m.test(await readFile(`${ROOT}content/posts/${s}/index.md`, 'utf8'))) staleImported.push(`- \`${s}\``);
  }

  const unused = media.filter((m) => !usedMedia.has(m.id)).sort((a, b) => a.id - b.id);
  const bios = terms.filter((t) => t.description.trim());
  const nonPost = legacy.filter((u) => !published.some((p) => p.link === u) && !u.includes('/wp-content/'));

  note('# WordPress import report');
  note();
  note('Written by `bin/import-wp.ts` (`docs/specs/wordpress-import.md`). Every list below is');
  note('sorted, so two runs on an unchanged site give the same file.');
  note();
  note(`- Posts imported: ${rows.length} of ${published.length} published`);
  note(`- Authors with at least one post: ${usedAuthors.size} of ${terms.length} terms`);
  note(`- Posts read from the rendered page (no post-content element): ${bricksNotes.length}`);
  note(`- Old sitemap URLs: ${legacy.length} (\`import/legacy-urls.txt\`)`);
  const section = (title: string, lines: string[], none = 'None.') => {
    note(); note(`## ${title}`); note();
    if (lines.length) lines.sort().forEach((l) => note(l)); else note(none);
  };
  section('Conversion problems (post not written)', problems);
  section('Text differences against the live page', diffs, 'None: every imported text equals the live page, word for word.');
  section('Posts without an author (imported as drafts until named)', unassigned);
  section('Posts without a cover', noCover);
  section('Covers narrower than 1200 px', narrowCover);
  section('Posts read from the rendered page', bricksNotes);
  note(); note(`## Citations under the article`); note(); note(`${citations.length} posts have one, stored as \`source\`.`);
  section('Citation links into the WordPress uploads (they need a home on the new site before cut-over)', citationUploads);
  section('Redirects written to import/redirects.tsv (the PDF, portraits, covers)', redirects.map((r) => `- \`${r.split('\t')[0]}\` → \`${r.split('\t')[1]}\``));
  section('Author descriptions not imported (bios are owner-supplied)', bios.map((t) => `- \`${t.slug}\`: "${t.description.trim()}"`));
  section('Media not used as a cover or portrait', unused.map((m) => `- ${m.id} ${m.mime_type} ${path(m.source_url)}${m.post ? ` (attached to post ${m.post}${published.find((p) => p.id === m.post) ? `, \`${published.find((p) => p.id === m.post)!.slug}\`` : ''})` : ' (attached to nothing)'}`));
  section('Imported post folders no longer on WordPress', staleImported);
  section('Old non-post URLs (each needs a page, a redirect or a 410)', nonPost.map((u) => `- \`${path(u)}\``));
  await writeFile(`${ROOT}import/report.md`, report.join('\n') + '\n');

  console.log(`wrote ${rows.length} posts and ${quoteSlugs.length} quotes, ${terms.length} authors; problems ${problems.length}, text differences ${diffs.length}`);
  console.log('report: import/report.md');
  if (problems.length || diffs.length) process.exitCode = 1;
}

await main();
