// Every indexable URL with its last real change (docs/seo.md, sitemap and feeds).
import { authorPath, getAuthors, getPosts, indexable, postPath, PER_PAGE } from './site.ts';
import { isoBucharest } from './dates.ts';

export async function sitemapEntries(): Promise<{ path: string; lastmod?: Date }[]> {
  const posts = await getPosts();
  const changed = (p: (typeof posts)[number]) => p.data.updated ?? p.data.date;
  const newest = posts.map(changed).sort((a, b) => b.getTime() - a.getTime())[0];
  const entries: { path: string; lastmod?: Date }[] = [
    { path: '/', lastmod: newest },
    { path: '/blog/', lastmod: newest },
    { path: '/authors/' },
  ];
  for (let n = 2; n <= Math.ceil(posts.length / PER_PAGE); n++) entries.push({ path: `/blog/page/${n}/` });
  for (const author of (await getAuthors()).values()) {
    const own = posts.filter((p) => p.data.author.some((a) => a.id === author.id));
    if (indexable(own.length)) entries.push({ path: authorPath(author), lastmod: own.map(changed).sort((a, b) => b.getTime() - a.getTime())[0] });
  }
  for (const post of posts) entries.push({ path: postPath(post), lastmod: changed(post) });
  return entries;
}

export const lastmod = (d?: Date) => (d ? `<lastmod>${isoBucharest(d)}</lastmod>` : '');
