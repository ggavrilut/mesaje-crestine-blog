import { absolute } from '../lib/site.ts';
import { lastmod, sitemapEntries } from '../lib/sitemap.ts';

export async function GET() {
  const urls = (await sitemapEntries()).map((e) => `<url><loc>${absolute(e.path)}</loc>${lastmod(e.lastmod)}</url>`);
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.join('\n') +
    '\n</urlset>\n';
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
