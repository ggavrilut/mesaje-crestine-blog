import { absolute } from '../lib/site.ts';

// Allow everything, point at the sitemap (docs/seo.md, canonical, robots, indexability).
export const GET = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${absolute('/sitemap-index.xml')}\n`, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
