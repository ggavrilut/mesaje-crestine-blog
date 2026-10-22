// RSS 2.0 at /rss.xml; WordPress's /feed/ 301s here (docs/seo.md, sitemap and feeds).
import { SITE_NAME, absolute, authorsOf, getAuthors, getPosts, postPath } from '../lib/site.ts';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function GET() {
  const authors = await getAuthors();
  const items = (await getPosts()).slice(0, 20).map((post) => {
    const url = absolute(postPath(post));
    return [
      '<item>',
      `<title>${esc(post.data.title)}</title>`,
      `<link>${url}</link>`,
      `<guid isPermaLink="true">${url}</guid>`,
      `<pubDate>${post.data.date.toUTCString()}</pubDate>`,
      ...authorsOf(post, authors).map((a) => `<dc:creator>${esc(a.data.name)}</dc:creator>`),
      post.data.description && `<description>${esc(post.data.description)}</description>`,
      '</item>',
    ].filter(Boolean).join('');
  });
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom"><channel>' +
    `<title>${esc(SITE_NAME)}</title><link>${absolute('/')}</link><language>ro</language>` +
    `<description>${esc('Meditații, predici și scrieri creștine în limba română')}</description>` +
    `<atom:link href="${absolute('/rss.xml')}" rel="self" type="application/rss+xml"/>` +
    items.join('\n') +
    '</channel></rss>\n';
  return new Response(xml, { headers: { 'content-type': 'application/rss+xml; charset=utf-8' } });
}
