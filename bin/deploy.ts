// Uploads the built site over FTPS (docs/specs/deploy.md, docs/specs/cutover.md). Without --yes
// it only builds, compares and prints the plan; nothing on the server changes. With --yes
// <plan ID> it carries out that exact plan. Deletes only files its own previous deploy uploaded.
//
// Targets: `preview` (the password-protected subdomain); `live` (mesaje-crestine.ro); and
// `rehearsal`, the live switch played on the preview folder. On `live` and `rehearsal`, while the
// folder still holds WordPress (no manifest yet), the plan is the cut-over switch: upload next to
// WordPress, swap the .htaccess, move WordPress's items into a closed `_wordpress/`. Afterwards
// they deploy like the preview. `--rollback` undoes the switch while `_wordpress/` exists.
// Run: node bin/deploy.ts <preview|rehearsal|live> [--rollback] [--yes <plan ID>]
import { Client, type FileInfo } from 'basic-ftp';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { Readable, Writable } from 'node:stream';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = `${ROOT}dist/`;
const MANIFEST = '.deploy-manifest.json';
const LIVE = 'https://mesaje-crestine.ro';
const WORDPRESS = '_wordpress';
const TARGETS = {
  // public_html/nou, served as nou.mesaje-crestine.ro; protected by cPanel Directory Privacy.
  preview: { dir: '/nou', url: 'https://nou.mesaje-crestine.ro', protected: true, switch: false },
  rehearsal: { dir: '/nou', url: 'https://nou.mesaje-crestine.ro', protected: true, switch: true },
  // The FTP account's root is public_html.
  live: { dir: '', url: LIVE, protected: false, switch: true },
} as const;
type Target = keyof typeof TARGETS;
/** Never moved by the switch: the host's (certificates, quota, PHP's log), the preview, the switch's own. */
const KEEP = new Set(['.', '..', '.well-known', '.ftpquota', 'error_log', 'cgi-bin', 'nou', WORDPRESS, MANIFEST, '.htaccess']);

interface Manifest { commit: string; deployed: string; files: Record<string, string>; moved?: string[] }

function die(message: string): never { console.error(`deploy: ${message}`); process.exit(1); }
const sha256 = (data: Buffer | string) => createHash('sha256').update(data).digest('hex');
const git = (...args: string[]) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
const USAGE = 'usage: node bin/deploy.ts <preview|rehearsal|live> [--rollback] [--yes <plan ID>]';

// --- arguments -----------------------------------------------------------------------------
const args = process.argv.slice(2);
const name = args.shift() as Target;
const rollback = args[0] === '--rollback' ? Boolean(args.shift()) : false;
const [flag, approved] = args;
if (!(name in TARGETS)) die(USAGE);
if (flag !== undefined && (flag !== '--yes' || !approved || args.length > 2)) die(USAGE);
if (rollback && !TARGETS[name].switch) die('--rollback undoes the cut-over switch: only on "live" and "rehearsal"');
const target = TARGETS[name];
const at = (path: string) => `${target.dir}/${path}`;

// --- the exact commit, built --------------------------------------------------------------
if (git('status', '--porcelain')) die('the working tree has uncommitted changes: deploy a commit, not a working tree');
if (name === 'live' && git('rev-parse', '--abbrev-ref', 'HEAD') !== 'main') die('the live site is deployed from main');
const commit = git('rev-parse', 'HEAD');
if (!rollback) {
  console.log(`deploy: building ${commit.slice(0, 7)}…`);
  try {
    execFileSync('npm', ['run', 'build'], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    const out = `${(e as { stdout?: Buffer }).stdout ?? ''}${(e as { stderr?: Buffer }).stderr ?? ''}`;
    die(`the build failed:\n${out.split('\n').slice(-25).join('\n')}`);
  }
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
const put = (client: Client, text: string | Buffer, path: string) => client.uploadFrom(Readable.from(Buffer.from(text)), path);

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

if (target.protected) {
  const probe = await fetch(`${target.url}/`, { redirect: 'manual' }).catch((e) => die(`${target.url} unreachable: ${e.message}`));
  if (probe.status !== 401) die(`${target.url} answers ${probe.status}, not 401: protect public_html${target.dir} in cPanel (Directory Privacy) first`);
}

/** The plan's ID: a yes covers exactly what was shown. */
const planOf = (plan: unknown) => sha256(JSON.stringify({ target: name, commit, plan })).slice(0, 12);
function approve(planId: string, command: string) {
  if (flag !== '--yes') {
    console.log(`\nNothing was changed. To carry out exactly this plan: npm run deploy -- ${command} --yes ${planId}`);
    process.exit(0);
  }
  if (approved !== planId) die(`plan ${approved} was approved, but the plan is now ${planId}: review it again`);
}

const client = new Client(60_000);
try {
  await client.access({ host: FTP_HOST, user: FTP_USER, password: FTP_PASSWORD, secure: true });
  const listing: FileInfo[] = await client.list(target.dir || '/');
  const names = new Set(listing.map((f) => f.name));
  const remoteManifest: Manifest | null = JSON.parse((await download(client, at(MANIFEST))) ?? 'null');
  const remoteHtaccess = (await download(client, at('.htaccess'))) ?? '';
  const auth = authLines(remoteHtaccess);
  if (target.protected && !auth.some((l) => /AuthUserFile/i.test(l))) die(`no Directory Privacy lines in ${target.dir}/.htaccess on the server: protect the folder in cPanel first`);

  if (rollback) {
    // --- undo the switch: WordPress back, its .htaccess back, the deployed files gone --------
    if (!names.has(WORDPRESS) || !remoteManifest?.moved) die(`nothing to roll back: no ${WORDPRESS}/ or no switch recorded in the manifest`);
    const saved = await download(client, at(`${WORDPRESS}/htaccess.wordpress`));
    if (saved === null) die(`${WORDPRESS}/htaccess.wordpress is missing: restore the .htaccess by hand`);
    const files = Object.keys(remoteManifest.files).filter((p) => p !== '.htaccess').sort();
    const dirs = [...new Set(files.filter((p) => p.includes('/')).map((p) => p.split('/')[0]))].sort();
    const planId = planOf({ rollback: true, moved: remoteManifest.moved, files });
    console.log(`deploy plan ${planId}: roll back the switch on ${name} (${target.url}, ftp ${target.dir || '/'}), switched to ${remoteManifest.commit.slice(0, 7)}`);
    console.log(`  move back from ${WORDPRESS}/: ${remoteManifest.moved.join(', ')}`);
    console.log(`  restore the .htaccess saved at the switch; delete ${files.length} deployed files and the folders ${dirs.join(', ')}`);
    approve(planId, `${name} --rollback`);

    for (const item of remoteManifest.moved) await client.rename(at(`${WORDPRESS}/${item}`), at(item));
    await put(client, saved, at('.htaccess')); // as it was at the switch, password lines included
    for (const path of files.filter((p) => !p.includes('/'))) await client.remove(at(path), true);
    for (const dir of dirs) await client.removeDir(at(dir));
    await client.remove(at(MANIFEST), true);
    await client.remove(at(`${WORDPRESS}/htaccess.wordpress`), true);
    await client.remove(at(`${WORDPRESS}/.htaccess`), true);
    await client.removeDir(at(WORDPRESS));
    console.log(`deploy: ${name} is back on WordPress`);
    process.exit(0);
  }

  // What would be on the server: every built file, the .htaccess rewritten for a protected target.
  const local = new Map<string, Buffer>();
  for (const path of (await walk(DIST)).sort()) {
    const bytes = await readFile(`${DIST}${path}`);
    local.set(path, path === '.htaccess' && target.protected ? Buffer.from(previewHtaccess(bytes.toString('utf8'), auth)) : bytes);
  }
  const hashes = Object.fromEntries([...local].map(([p, b]) => [p, sha256(b)]));
  const switching = target.switch && !remoteManifest;
  const before = remoteManifest?.files ?? {};
  const upload = [...local.keys()].filter((p) => before[p] !== hashes[p]);
  const remove = Object.keys(before).filter((p) => !local.has(p)).sort();

  // The switch moves every item of the folder that is neither kept nor the new site's.
  const move = switching ? [...names].filter((n) => !KEEP.has(n)).sort() : [];
  if (switching) {
    const collide = [...new Set([...local.keys()].map((p) => p.split('/')[0]))].filter((n) => names.has(n) && !KEEP.has(n));
    if (collide.length) die(`the new site and the folder share names: ${collide.join(', ')}; the switch expects a WordPress folder`);
    if (names.has(WORDPRESS)) die(`${WORDPRESS}/ already exists: an earlier switch? Roll it back or remove it first`);
  }

  const planId = planOf({ upload: upload.map((p) => [p, hashes[p]]), remove, move });
  const bytes = upload.reduce((n, p) => n + local.get(p)!.length, 0);
  console.log(`deploy plan ${planId}: ${name} (${target.url}, ftp ${target.dir || '/'}), commit ${commit.slice(0, 7)}${switching ? ', CUT-OVER SWITCH' : ''}`);
  console.log(`  on the server now: ${remoteManifest ? `commit ${remoteManifest.commit.slice(0, 7)}, ${Object.keys(before).length} files` : switching ? 'WordPress (no deploy yet)' : 'no earlier deploy'}`);
  console.log(`  upload ${upload.length} files (${(bytes / 1048576).toFixed(1)} MB), delete ${remove.length}, unchanged ${local.size - upload.length}`);
  for (const p of remove) console.log(`  delete ${p}`);
  if (switching) {
    console.log(`  then replace the .htaccess (the current one saved as ${WORDPRESS}/htaccess.wordpress)`);
    console.log(`  then move into ${WORDPRESS}/ (closed to the web): ${move.join(', ')}`);
    console.log(`  kept in place: ${[...names].filter((n) => KEEP.has(n) && n !== '.' && n !== '..').join(', ')}`);
  }
  approve(planId, name);

  // Assets first, pages next, .htaccess last: a page never names a missing file, and on the
  // switch WordPress keeps answering its own URLs until the .htaccess changes.
  const order = (p: string) => (p === '.htaccess' ? 2 : p.endsWith('.html') ? 1 : 0);
  const queue = [...upload].sort((a, b) => order(a) - order(b) || a.localeCompare(b));
  const dirs = new Set<string>();
  let done = 0;
  for (const path of queue) {
    if (path === '.htaccess' && switching) {
      await client.ensureDir(at(WORDPRESS));
      await put(client, '# WordPress, moved here at the cut-over (bin/deploy.ts): closed to the web.\nRequire all denied\n', at(`${WORDPRESS}/.htaccess`));
      await put(client, remoteHtaccess, at(`${WORDPRESS}/htaccess.wordpress`));
      await client.cd('/');
    }
    const remote = at(path);
    const dir = remote.slice(0, remote.lastIndexOf('/'));
    if (dir && !dirs.has(dir)) { await client.ensureDir(dir); dirs.add(dir); await client.cd('/'); }
    await client.uploadFrom(Readable.from(local.get(path)!), remote);
    if (++done % 100 === 0 || done === queue.length) console.log(`  uploaded ${done}/${queue.length}`);
  }
  for (const item of move) await client.rename(at(item), at(`${WORDPRESS}/${item}`));
  for (const path of remove) await client.remove(at(path), true);
  const manifest: Manifest = { commit, deployed: new Date().toISOString(), files: hashes, ...(switching ? { moved: move } : remoteManifest?.moved ? { moved: remoteManifest.moved } : {}) };
  await put(client, JSON.stringify(manifest, null, 1), at(MANIFEST));

  // Check: the server holds this commit and answers as it should.
  const check: Manifest = JSON.parse((await download(client, at(MANIFEST))) ?? '{}');
  if (check.commit !== commit) die(`the manifest on the server names ${check.commit}, not ${commit}`);
  if (target.protected) {
    const after = await fetch(`${target.url}/`, { redirect: 'manual' });
    if (after.status !== 401) die(`after the upload ${target.url} answers ${after.status}, not 401: check the .htaccess on the server`);
    console.log(`deploy: ${name} now serves ${commit.slice(0, 7)} at ${target.url} (password-protected)`);
  } else {
    const home = await fetch(`${target.url}/`);
    const page = await fetch(`${target.url}/kenosis/`);
    const old = await fetch(`${target.url}/2023/02/kenosis/`, { redirect: 'manual' });
    const worker = await fetch(`${target.url}/superpwa-sw.js`);
    const problems = [
      home.status === 200 && (await home.text()).includes('data-consent') ? '' : `/ answers ${home.status} or is not the new site`,
      page.status === 200 ? '' : `/kenosis/ answers ${page.status}`,
      old.status === 301 && old.headers.get('location') === `${target.url}/kenosis/` ? '' : `/2023/02/kenosis/ answers ${old.status} ${old.headers.get('location') ?? ''}`,
      worker.status === 200 && (await worker.text()).includes("const VERSION") ? '' : `/superpwa-sw.js answers ${worker.status} or is not the new worker`,
    ].filter(Boolean);
    if (problems.length) die(`after the upload: ${problems.join('; ')} (roll back with: npm run deploy -- ${name} --rollback)`);
    console.log(`deploy: ${name} now serves ${commit.slice(0, 7)} at ${target.url}; home, a post, an old URL and the app's worker answer as expected`);
  }
} finally {
  client.close();
}
