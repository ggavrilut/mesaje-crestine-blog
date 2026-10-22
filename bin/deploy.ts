// Uploads the built site over FTPS (docs/specs/deploy.md). Without --yes it only builds,
// compares and prints the plan; nothing on the server changes. With --yes <plan ID> it uploads
// that exact plan. Deletes only files its own previous deploy uploaded.
// Run: node bin/deploy.ts preview [--yes <plan ID>]
import { Client } from 'basic-ftp';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { Readable, Writable } from 'node:stream';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = `${ROOT}dist/`;
const MANIFEST = '.deploy-manifest.json';
const LIVE = 'https://mesaje-crestine.ro';
const TARGETS = {
  // public_html/nou, served as nou.mesaje-crestine.ro; protected by cPanel Directory Privacy.
  preview: { dir: '/nou', url: 'https://nou.mesaje-crestine.ro' },
} as const;
type Target = keyof typeof TARGETS;

interface Manifest { commit: string; deployed: string; files: Record<string, string> }

const die = (message: string): never => { console.error(`deploy: ${message}`); process.exit(1); };
const sha256 = (data: Buffer | string) => createHash('sha256').update(data).digest('hex');
const git = (...args: string[]) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();

// --- arguments -----------------------------------------------------------------------------
const [name, flag, approved] = process.argv.slice(2);
if (name === 'live') die('the live target waits for the cut-over procedure (docs/workflow.md); only "preview" exists');
if (!(name in TARGETS)) die('usage: node bin/deploy.ts preview [--yes <plan ID>]');
if (flag !== undefined && (flag !== '--yes' || !approved)) die('usage: node bin/deploy.ts preview [--yes <plan ID>]');
const target = TARGETS[name as Target];

// --- the exact commit, built --------------------------------------------------------------
if (git('status', '--porcelain')) die('the working tree has uncommitted changes: deploy a commit, not a working tree');
const commit = git('rev-parse', 'HEAD');
console.log(`deploy: building ${commit.slice(0, 7)}…`);
try {
  execFileSync('npm', ['run', 'build'], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
} catch (e) {
  const out = `${(e as { stdout?: Buffer }).stdout ?? ''}${(e as { stderr?: Buffer }).stderr ?? ''}`;
  die(`the build failed:\n${out.split('\n').slice(-25).join('\n')}`);
}

async function walk(dir: string, prefix = ''): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = `${prefix}${entry.name}`;
    if (entry.isDirectory()) out.push(...(await walk(`${dir}${entry.name}/`, `${rel}/`)));
    else out.push(rel);
  }
  return out;
}

// --- the server's side ---------------------------------------------------------------------
async function download(client: Client, path: string): Promise<string | null> {
  const chunks: Buffer[] = [];
  const sink = new Writable({ write(chunk, _enc, done) { chunks.push(chunk); done(); } });
  try {
    await client.downloadTo(sink, path);
    return Buffer.concat(chunks).toString('utf8');
  } catch (e) {
    if ((e as { code?: number }).code === 550) return null; // no such file
    throw e;
  }
}

/** cPanel Directory Privacy's lines, wherever they sit in the server's .htaccess. */
const authLines = (htaccess: string) =>
  htaccess.split('\n').filter((l) => /^\s*(AuthType|AuthName|AuthUserFile|AuthGroupFile|Require\s+valid-user)\b/i.test(l));

/** The preview's .htaccess: cPanel's password, no indexing, redirects to the preview host. */
const previewHtaccess = (built: string, auth: string[]) => [
  '# Preview (bin/deploy.ts): cPanel Directory Privacy lines, kept from the server.',
  ...auth,
  '<IfModule mod_headers.c>',
  '  Header set X-Robots-Tag "noindex, nofollow"',
  '</IfModule>',
  '',
  built.replaceAll(`${LIVE}/`, `${target.url}/`),
].join('\n');

const env = `${ROOT}.env`;
try { process.loadEnvFile(env); } catch { die('no .env (copy .env.example and fill it in)'); }
const { FTP_HOST, FTP_USER, FTP_PASSWORD } = process.env;
if (!FTP_HOST || !FTP_USER || !FTP_PASSWORD) die('.env needs FTP_HOST, FTP_USER and FTP_PASSWORD');

const probe = await fetch(`${target.url}/`, { redirect: 'manual' }).catch((e) => die(`${target.url} unreachable: ${e.message}`));
if (probe.status !== 401) die(`${target.url} answers ${probe.status}, not 401: protect public_html${target.dir} in cPanel (Directory Privacy) first`);

const client = new Client(60_000);
try {
  await client.access({ host: FTP_HOST, user: FTP_USER, password: FTP_PASSWORD, secure: true });
  const remoteManifest: Manifest | null = JSON.parse((await download(client, `${target.dir}/${MANIFEST}`)) ?? 'null');
  const remoteHtaccess = (await download(client, `${target.dir}/.htaccess`)) ?? '';
  const auth = authLines(remoteHtaccess);
  if (!auth.some((l) => /AuthUserFile/i.test(l))) die(`no Directory Privacy lines in ${target.dir}/.htaccess on the server: protect the folder in cPanel first`);

  // What would be on the server: every built file, the .htaccess rewritten for the preview.
  const local = new Map<string, Buffer>();
  for (const path of (await walk(DIST)).sort()) {
    const bytes = await readFile(`${DIST}${path}`);
    local.set(path, path === '.htaccess' ? Buffer.from(previewHtaccess(bytes.toString('utf8'), auth)) : bytes);
  }
  const before = remoteManifest?.files ?? {};
  const hashes = Object.fromEntries([...local].map(([p, b]) => [p, sha256(b)]));
  const upload = [...local.keys()].filter((p) => before[p] !== hashes[p]);
  const remove = Object.keys(before).filter((p) => !local.has(p)).sort();
  const planId = sha256(JSON.stringify({ target: name, commit, upload: upload.map((p) => [p, hashes[p]]), remove })).slice(0, 12);
  const bytes = upload.reduce((n, p) => n + local.get(p)!.length, 0);

  console.log(`deploy plan ${planId}: ${name} (${target.url}, ftp ${target.dir}), commit ${commit.slice(0, 7)}`);
  console.log(`  on the server now: ${remoteManifest ? `commit ${remoteManifest.commit.slice(0, 7)}, ${Object.keys(before).length} files` : 'no earlier deploy'}`);
  console.log(`  upload ${upload.length} files (${(bytes / 1048576).toFixed(1)} MB), delete ${remove.length}, unchanged ${local.size - upload.length}`);
  for (const p of remove) console.log(`  delete ${p}`);

  if (flag !== '--yes') {
    console.log(`\nNothing was changed. To upload exactly this plan: npm run deploy -- ${name} --yes ${planId}`);
    process.exit(0);
  }
  if (approved !== planId) die(`plan ${approved} was approved, but the plan is now ${planId}: review it again`);

  // Assets first, pages next, .htaccess and the manifest last: a page never names a missing file.
  const order = (p: string) => (p === '.htaccess' ? 2 : p.endsWith('.html') ? 1 : 0);
  const queue = [...upload].sort((a, b) => order(a) - order(b) || a.localeCompare(b));
  const dirs = new Set<string>();
  let done = 0;
  for (const path of queue) {
    const remote = `${target.dir}/${path}`;
    const dir = remote.slice(0, remote.lastIndexOf('/'));
    if (!dirs.has(dir)) { await client.ensureDir(dir); dirs.add(dir); }
    await client.uploadFrom(Readable.from(local.get(path)!), remote);
    if (++done % 100 === 0 || done === queue.length) console.log(`  uploaded ${done}/${queue.length}`);
  }
  for (const path of remove) await client.remove(`${target.dir}/${path}`, true);
  const manifest: Manifest = { commit, deployed: new Date().toISOString(), files: hashes };
  await client.uploadFrom(Readable.from(Buffer.from(JSON.stringify(manifest, null, 1))), `${target.dir}/${MANIFEST}`);

  // Check: the server holds this commit, and the preview still asks for its password.
  const check: Manifest = JSON.parse((await download(client, `${target.dir}/${MANIFEST}`)) ?? '{}');
  const after = await fetch(`${target.url}/`, { redirect: 'manual' });
  if (check.commit !== commit) die(`the manifest on the server names ${check.commit}, not ${commit}`);
  if (after.status !== 401) die(`after the upload ${target.url} answers ${after.status}, not 401: check the .htaccess on the server`);
  console.log(`deploy: ${name} now serves ${commit.slice(0, 7)} at ${target.url} (password-protected)`);
} finally {
  client.close();
}
