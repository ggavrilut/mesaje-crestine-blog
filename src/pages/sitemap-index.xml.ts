// The sitemap: only canonical, indexable, 200 URLs, with lastmod only where content changed
// (docs/seo.md, sitemap and feeds). One child sitemap holds them all until 50,000 URLs.
import { absolute } from '../lib/site.ts';

export async function GET() {
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    `<sitemap><loc>${absolute('/sitemap-0.xml')}</loc></sitemap>` +
    '</sitemapindex>\n';
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
