// The site's .htaccess (docs/architecture.md, redirects): a 301 from each post's legacyUrl,
// the importer's redirect list, then the hand-written rules. Built as htaccess.txt and renamed
// by src/integrations/build-checks.ts, since Astro does not route dot-files.
import { getCollection } from 'astro:content';
import { readFile } from 'node:fs/promises';
import { SITE_URL } from '../lib/site.ts';

const escape = (s: string) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
const exact = (from: string) => `^${escape(from).replace(/\/$/, '')}/?$`;
/** An uploaded image also answers as WordPress's resized copies: name-scaled.jpg, name-1024x768.jpg. */
const IMAGE = /^(\/wp-content\/uploads\/.+?)(?:-scaled)?\.(jpe?g|png|webp|gif)$/i;
const pattern = (from: string) => {
  const image = from.match(IMAGE);
  return image ? `^${escape(image[1])}(?:-scaled|-[0-9]+x[0-9]+)?\\.${image[2]}$` : exact(from);
};

export async function GET() {
  // Drafts too: an imported draft's old URL must keep pointing at its future page.
  const posts = (await getCollection('posts')).filter((p) => p.data.legacyUrl).sort((a, b) => a.id.localeCompare(b.id));
  const postRules = posts.map((p) => `RedirectMatch 301 ${exact(new URL(p.data.legacyUrl!).pathname)} ${SITE_URL}/${p.id}/`);

  const imported = (await readFile('import/redirects.tsv', 'utf8')) // paths from the project root, where astro runs
    .split('\n')
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [from, to] = line.split('\t');
      return `RedirectMatch 301 ${pattern(from)} ${SITE_URL}${to}`;
    });

  const body = [
    '# Generated at build by src/pages/htaccess.txt.ts: edit the sources, not this file.',
    'ErrorDocument 404 /404.html',
    'ErrorDocument 410 /404.html',
    '',
    '# The app\'s worker and manifest (specs/pwa.md): revalidated on every visit, so a new version',
    '# reaches installed apps at once.',
    '<IfModule mod_headers.c>',
    '  <FilesMatch "^superpwa-(sw\\.js|manifest\\.json)$">',
    '    Header set Cache-Control "no-cache"',
    '  </FilesMatch>',
    '</IfModule>',
    '',
    '# PHP on cPanel logs to an error_log file next to the script (contact.php): never served.',
    '<Files "error_log">',
    '  Require all denied',
    '</Files>',
    '',
    '# Posts: /YYYY/MM/<slug>/ -> /<slug>/ (each post\'s legacyUrl)',
    ...postRules,
    '',
    '# From the WordPress import (import/redirects.tsv)',
    ...imported,
    '',
    (await readFile('src/redirects/static.htaccess', 'utf8')).trimEnd(),
    '',
  ].join('\n');
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
