// Checks each post's source.txt against where its text came from (docs/content-model.md, the
// check): the Google Doc for a post with `sourceDoc`, byte for byte through bin/fetch-doc; the
// live WordPress page for an imported post, word for word as the importer compares, until
// cut-over. A match is stamped, so bin/check accepts that exact source.txt as a change.
// Reads only; writes nothing in content/. Run: node bin/verify-text.ts [<slug>...]
// Exits 1 when a text differs from its origin or could not be checked.
import * as cheerio from 'cheerio';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { isBricksPage, liveText } from './lib/live-text.ts';
import { firstDifference } from '../src/lib/text.ts';

const ROOT = new URL('..', import.meta.url).pathname;
const POSTS = `${ROOT}content/posts/`;
// Git-ignored, per machine: a stamp only lets bin/check pass a change made on this clone.
const STAMPS = `${ROOT}node_modules/.cache/verify-text/`;
const run = promisify(execFile);

interface Result { slug: string; status: 'ok' | 'differs' | 'skipped' | 'error'; detail: string }

const field = (front: string, name: string) => front.match(new RegExp(`^${name}: "?([^"\\n]+?)"?$`, 'm'))?.[1];
const sha256 = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
const describe = (diff: ReturnType<typeof firstDifference>, origin: string) =>
  diff ? `word ${diff.index}: ${origin} "${diff.expected}" / source.txt "${diff.actual}"` : 'same words, different spaces or line breaks';

async function againstDoc(slug: string, link: string, source: Buffer): Promise<Result> {
  const dir = await mkdtemp(join(tmpdir(), 'verify-text-'));
  try {
    await run(`${ROOT}bin/fetch-doc`, [link, slug, dir]);
    const doc = await readFile(`${dir}/source.txt`);
    if (doc.equals(source)) return { slug, status: 'ok', detail: 'equals its Google Doc, byte for byte' };
    return { slug, status: 'differs', detail: describe(firstDifference(doc.toString('utf8'), source.toString('utf8')), 'doc') };
  } catch (e) {
    const stderr = (e as { stderr?: string }).stderr?.trim();
    return { slug, status: 'error', detail: `could not read the doc: ${stderr || (e as Error).message}` };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function againstWordPress(slug: string, url: string, source: Buffer): Promise<Result> {
  try {
    const res = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'mesaje-crestine-verify-text (read-only)' } });
    if (res.status >= 300 && res.status < 400) {
      return { slug, status: 'skipped', detail: 'the WordPress URL now redirects (after cut-over): git history is the record' };
    }
    if (!res.ok) return { slug, status: 'error', detail: `WordPress answered ${res.status}` };
    const page = cheerio.load(await res.text());
    const diff = firstDifference(liveText(page, isBricksPage(page)), source.toString('utf8'));
    return diff
      ? { slug, status: 'differs', detail: describe(diff, 'live page') }
      : { slug, status: 'ok', detail: 'equals the live WordPress page, word for word' };
  } catch (e) {
    return { slug, status: 'error', detail: `could not read ${url}: ${(e as Error).message}` };
  }
}

async function verify(slug: string): Promise<Result> {
  const sourcePath = `${POSTS}${slug}/source.txt`;
  if (!existsSync(sourcePath)) return { slug, status: 'error', detail: 'no source.txt' };
  const source = await readFile(sourcePath);
  const front = (await readFile(`${POSTS}${slug}/index.md`, 'utf8')).split(/^---$/m)[1] ?? '';
  const doc = field(front, 'sourceDoc');
  const legacy = field(front, 'legacyUrl');
  const result = doc ? await againstDoc(slug, doc, source)
    : legacy ? await againstWordPress(slug, legacy, source)
    : { slug, status: 'skipped' as const, detail: 'no origin recorded (sourceDoc or legacyUrl): git history is the record' };
  if (result.status === 'ok') {
    await mkdir(STAMPS, { recursive: true });
    await writeFile(`${STAMPS}${slug}`, sha256(source) + '\n');
  }
  return result;
}

const all = (await readdir(POSTS, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name).sort();
const asked = process.argv.slice(2);
const unknown = asked.filter((s) => !all.includes(s));
if (unknown.length) {
  console.error(`verify-text: no post ${unknown.join(', ')} in content/posts/`);
  process.exit(1);
}

// Four at a time: polite to WordPress and Google.
const slugs = asked.length ? asked : all;
const results: Result[] = [];
for (let i = 0; i < slugs.length; i += 4) results.push(...(await Promise.all(slugs.slice(i, i + 4).map(verify))));

const label = { ok: 'ok     ', differs: 'DIFFERS', skipped: 'skipped', error: 'ERROR  ' };
for (const r of results) if (r.status !== 'ok' || asked.length) console.log(`${label[r.status]} ${r.slug}: ${r.detail}`);
const count = (s: Result['status']) => results.filter((r) => r.status === s).length;
console.log(`verify-text: ${count('ok')} ok, ${count('differs')} differ, ${count('skipped')} skipped, ${count('error')} could not be checked`);
if (count('differs') || count('error')) process.exitCode = 1;
