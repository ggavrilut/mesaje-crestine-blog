// Checks every old WordPress URL against the built site (docs/specs/wordpress-import.md):
// each must be one 301 to a page that exists, a page that exists at the same path, or a
// deliberate 410. Applies dist/.htaccess as Apache's mod_alias does (first matching
// RedirectMatch wins) and resolves targets against dist/; the live check after a deploy is
// the publisher's. Run after a build: node bin/check-redirects.ts
import { existsSync, readFileSync, statSync } from 'node:fs';

const SITE = 'https://mesaje-crestine.ro';
const ROOT = new URL('..', import.meta.url).pathname;
const DIST = `${ROOT}dist`;

/** URLs WordPress answers that no sitemap lists: one of each pattern in docs/seo.md, the move. */
const PATTERNS = [
  '/feed/', '/2021/10/partasia/feed/', '/sitemap.xml', '/post-sitemap.xml', '/sitemap.rss',
  '/2021/', '/2021/10/', '/2021/10/page/2/', '/page/2/', '/blog/page/2/', '/acasa-2/',
  '/category/uncategorized/', '/tag/rugaciune/', '/author/coroiu-liviu/', '/authors/paris-reidhead/page/2/',
  '/sitemap_index.xml', '/wp-sitemap.xml',
  '/2021/10/partasia',
];

interface Rule { status: number; pattern: RegExp; target?: string; line: number }

const rules: Rule[] = readFileSync(`${DIST}/.htaccess`, 'utf8')
  .split('\n')
  .map((text, i) => [text.trim(), i + 1] as const)
  .filter(([text]) => text.startsWith('RedirectMatch '))
  .map(([text, line]) => {
    const [, status, pattern, target] = text.split(/\s+/);
    return { status: Number(status), pattern: new RegExp(pattern), target, line };
  });

const match = (path: string) => {
  for (const rule of rules) {
    const m = path.match(rule.pattern);
    if (m) return { rule, to: rule.target?.replace(/\$(\d)/g, (_, n) => m[Number(n)] ?? '') };
  }
  return undefined;
};

/** What the built site answers for a path with no redirect: 200 or 404. */
const serves = (path: string) => {
  const file = `${DIST}${decodeURIComponent(path)}`;
  if (path.endsWith('/')) return existsSync(`${file}index.html`);
  return existsSync(file) && statSync(file).isFile();
};

type Outcome = 'ok' | 'gone' | 'fail';
function check(path: string): [Outcome, string] {
  const hit = match(path);
  if (!hit) {
    if (serves(path)) return ['ok', '200'];
    if (!path.endsWith('/') && serves(`${path}/`)) return ['ok', `301 (Apache DirectorySlash) -> ${path}/ -> 200`];
    return ['fail', 'no redirect and no page: 404'];
  }
  const { rule, to } = hit;
  if (rule.status === 410) return ['gone', `410 (line ${rule.line})`];
  if (rule.status !== 301 || !to) return ['fail', `status ${rule.status} (line ${rule.line})`];
  if (!to.startsWith(`${SITE}/`)) return ['fail', `301 to another host: ${to}`];
  const target = new URL(to).pathname;
  if (match(target)) return ['fail', `redirect chain: ${to} redirects again`];
  if (!serves(target)) return ['fail', `301 -> ${to}, which is a 404`];
  return ['ok', `301 -> ${to} -> 200`];
}

const legacy = readFileSync(`${ROOT}import/legacy-urls.txt`, 'utf8').split('\n').filter(Boolean);
// The importer's redirects cover old URLs outside the sitemap too (the PDF of o-mantuire-asa-de-mare).
const imported = readFileSync(`${ROOT}import/redirects.tsv`, 'utf8').split('\n').filter((l) => l && !l.startsWith('#')).map((l) => l.split('\t')[0]);
const paths = [...new Set([...legacy.map((u) => new URL(u).pathname), ...PATTERNS, ...imported])];
const results = { ok: [] as string[], gone: [] as string[], fail: [] as string[] };
for (const path of paths) {
  const [outcome, detail] = check(path);
  results[outcome].push(`${path}  ${detail}`);
}

// The sitemap's image URLs wait for a rule (specs/wordpress-import.md): counted, not listed.
const isImage = (l: string) => l.startsWith('/wp-content/') && !imported.includes(l.split('  ')[0]);
const media = results.fail.filter(isImage);
const other = results.fail.filter((l) => !isImage(l));
console.log(`${paths.length} old URLs: ${results.ok.length} ok, ${results.gone.length} gone (410), ${results.fail.length} failing`);
if (process.argv.includes('--verbose')) [...results.ok, ...results.gone].forEach((l) => console.log(`ok    ${l}`));
other.forEach((l) => console.log(`FAIL  ${l}`));
if (media.length) console.log(`FAIL  ${media.length} image URLs under /wp-content/uploads/ have no rule yet`);
process.exitCode = results.fail.length ? 1 : 0;

// --live (specs/cutover.md): the same old URLs asked of the live site, which must answer what
// dist/ promises: the same 301 target, the 410, or the 200.
if (process.argv.includes('--live')) {
  const expected = (path: string): { status: number; to?: string } => {
    const hit = match(path);
    if (hit) return hit.rule.status === 410 ? { status: 410 } : { status: hit.rule.status, to: hit.to };
    if (serves(path)) return { status: 200 };
    return { status: 301, to: `${SITE}${path}/` }; // Apache's DirectorySlash
  };
  const live: string[] = [];
  const queue = [...paths];
  await Promise.all(Array.from({ length: 6 }, async () => {
    for (let path = queue.shift(); path; path = queue.shift()) {
      const want = expected(path);
      const res = await fetch(`${SITE}${path}`, { redirect: 'manual' }).catch((e) => ({ status: 0, headers: new Headers(), error: e.message }));
      const location = res.headers.get('location');
      const got = location ? new URL(location, SITE).href : undefined;
      const ok = res.status === want.status && (want.to === undefined || got === new URL(want.to, SITE).href);
      if (!ok) live.push(`${path}  live ${res.status}${got ? ` -> ${got}` : ''}, expected ${want.status}${want.to ? ` -> ${want.to}` : ''}`);
    }
  }));
  console.log(`live: ${paths.length} old URLs asked of ${SITE}: ${paths.length - live.length} as expected, ${live.length} not`);
  live.sort().forEach((l) => console.log(`LIVE  ${l}`));
  if (live.length) process.exitCode = 1;
}
