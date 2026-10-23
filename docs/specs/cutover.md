# Cut-over

Status: draft · Owner: Gabriel Gavrilut · Last updated: 2026-10-23

## Goal

mesaje-crestine.ro switches from WordPress to the new site in one short session, with no
visible downtime, every old URL answering as `check-redirects` promises, and a way back at
every step until WordPress's files are finally deleted. Decided: `decisions.md` (2026-10-22
cut-over: same cPanel account, WordPress removed; 2026-10-23: its database stays on the host;
no last import and no full backup, owner, the same day).

## Non-goals

- DNS, the domain, HTTPS or the host: unchanged. HTTP and `www` already 301 to
  `https://mesaje-crestine.ro/` at host level (checked 2026-10-23), not in `.htaccess`.
- Deleting WordPress's database (it stays, `decisions.md`) or the cPanel account's mail.
- Bing Webmaster Tools and IndexNow: after cut-over, proposed by the `seo` agent.

## What the live folder holds (FTP, read-only, 2026-10-23)

`public_html`: WordPress (`index.php`, `wp-*.php`, `xmlrpc.php`, `license.txt`,
`readme.html`, `wp-admin/`, `wp-content/`, `wp-includes/`, `wp-config.php`, `.htaccess` and
the host's `.htaccess.bak-xmlrpc-20261008`); the host's `.well-known/`, `.ftpquota` and
`error_log` (not served); the preview `nou/`. The `.htaccess` holds WordPress's rewrite block
and the host's block denying `xmlrpc.php` (added 2026-10-08); nothing else.

## Behaviour

Each step needs the owner's yes in the session that runs it (`hard-rules.md`).

**Before, nothing on the server changes**
- [ ] No last import: nothing new on WordPress (owner, 2026-10-23). From here the owner edits
  nothing in WordPress.
- [ ] `import-wordpress` is merged into `main`; the build, `bin/check`, `verify-text` (all
  posts) and `check-redirects` pass on `main`.
- [ ] No full backup (owner, 2026-10-23: what matters is already kept; the database stays on
  the host). WordPress's files are moved, not deleted, so the rollback stays possible until
  `_wordpress/` is deleted.

**The switch: `npm run deploy -- live`**
- [ ] Without `--yes` it prints the plan and changes nothing: the files to upload; the
  composed `.htaccess` (the generated rules); the WordPress items it will move, listed from
  the server by name (everything except `.well-known/`, `.ftpquota`, `error_log`, `nou/`);
  the commit and a plan ID. It refuses unless the tree is clean and on `main`.
- [ ] With `--yes <plan ID>`, in this order, so readers never meet a gap:
  1. uploads every file except `.htaccess`, next to WordPress (no name collides; WordPress
     still answers its own URLs);
  2. saves the live `.htaccess` as `_wordpress/htaccess.wordpress`, then uploads the new
     `.htaccess`: from this moment old URLs 301 to the new ones;
  3. moves the WordPress items into `public_html/_wordpress/`, which gets an `.htaccess`
     denying all web access; nothing is deleted;
  4. writes `.deploy-manifest.json` (as the preview does) and fetches `/`, a post, an old
     post URL and `/superpwa-sw.js`, failing loudly on any surprise.
- [ ] `npm run deploy -- live --rollback` (its own plan and yes) undoes the switch: moves
  WordPress back from `_wordpress/`, restores its `.htaccess`, deletes only the files the
  manifest lists.

**After**
- [ ] `npm run check-redirects -- --live` requests every old URL from the live site: one
  301 to a 200, a 200, or a 410; 0 failing.
- [ ] Owner checks: a message through the contact form arrives; GA4 Realtime shows a visit
  after Accept; the installed app on his phone shows the new site; the privacy page and the
  banner are there.
- [ ] Search Console (owner, or the `seo` agent with his yes): `/sitemap-index.xml`
  submitted; five old URLs inspected (a post, an image, a quote, a category, `/feed/`).
- [ ] The preview goes: `nou/` deleted over FTP (its own yes); the owner removes the
  subdomain and its Directory Privacy in cPanel.
- [ ] Two weeks later, with no open problem: `_wordpress/` deleted (its own yes). The
  database and the downloaded backup stay.

## Data and interfaces

- **Script**: `bin/deploy.ts` gains the `live` target (FTP root `/`, URL
  `https://mesaje-crestine.ro`), the move into `_wordpress/` and `--rollback`;
  `bin/check-redirects.ts` gains `--live`. Reads `.env` (`FTP_*`) as now; no secret printed.
- **Kept on the server**: `.well-known/` (certificates), `.ftpquota`, `error_log` (the
  generated `.htaccess` denies it), the contact form's config in the home folder, outside
  `public_html` (`contact.php` finds it by walking up, as on the preview).
- **Dropped**: the host's `xmlrpc.php` block, since `xmlrpc.php` goes with WordPress and
  `_wordpress/` is denied as a whole.
- **Test before the real switch**: the whole sequence, plan, `--yes` and `--rollback`, run
  against the preview folder holding a copy of WordPress's file names (empty files), so the
  move, the `.htaccess` swap and the rollback are proven on the real server first.

## Search Console on the day (owner; steps by the `seo` agent, 2026-10-23)

Menu names as in Google's help; **Indexing > Pages** is the "Page indexing" report, and
**Crawl stats** may sit under **Settings**. Sources: Google's site-move, Sitemaps, URL
Inspection, recrawl, Page indexing and Crawl stats help pages.

**Before the switch (2 min).** **Performance > Search results**, last 3 months, **Export**
(the baseline); note the 5 pages with most clicks (**Pages** tab).

**1. Property and sitemaps** (after `check-redirects --live` shows 0 failing)
1. Property type: `mesaje-crestine.ro` (Domain) or `https://mesaje-crestine.ro/` (URL prefix).
   **Settings > Ownership verification** must show the DNS method (**Domain name provider**);
   methods that relied on WordPress (an HTML tag, a file) stop working, harmless while DNS
   stays. Never delete the TXT record.
2. **Indexing > Sitemaps**: add `https://mesaje-crestine.ro/sitemap-index.xml` (URL-prefix
   property: `sitemap-index.xml`), **Submit**; expect Success, Sitemap index, about 100 pages.
3. Remove every old entry (`/sitemap.xml`, `*-sitemap.xml`, `/sitemap.rss`, …): row, **⋮**,
   **Remove sitemap**. They now redirect and submitted sitemaps do not follow redirects;
   removing does not make Google forget the URLs.

**2. URL Inspection** (search bar at the top; then **Test live URL**, which follows the 301)

| Old URL | Must 301 to |
|---|---|
| `/2021/10/partasia/` | `/partasia/` |
| `/wp-content/uploads/2021/10/IMG_7324.jpg` | `/sa-intelegem-caile-domnului/` |
| `/quote/105/` | `/un-slujitor-al-lui-dumnezeu-are-un-singur-stapan/` |
| `/category/uncategorized/` | `/blog/` |
| `/feed/` | `/rss.xml` (a feed: "not indexable" is expected) |

The indexed copy still shows the old page on day one: normal. **Request indexing** only on new
URLs: `/`, `/blog/`, `/partasia/`, the quote above, `/sa-intelegem-caile-domnului/`, then the
new URLs of the top 5 pages; stop at the daily limit (Google gives no number). Never on old
URLs or the feed. A 404, redirect or server error: stop, tell the developer
(`npm run deploy -- live --rollback`).

**3. Four weeks, Mondays (5 min)**
- **Sitemaps**: still Success. **Pages**, filtered to the sitemap: Indexed rising towards
  about 100. Normal: "Page with redirect" growing; 404/410 for `/wp-content/…`, `/template/`,
  `/sample-page/`, `/despre-noi/`; "Excluded by noindex" for the authors under two posts and
  `/offline/`. A problem: a new-sitemap URL with a redirect, 5xx, soft 404 or noindex error, or
  an old post URL as 404.
- **Crawl stats**: a rise in 301s is normal; a host-status warning or lasting 5xx is not.
- **Performance**, the 28 days after against the 28 before, by page: a dip in weeks 1–2 is
  normal ("may fluctuate temporarily"); clicks down by more than about a third at week 4, or a
  top page whose new URL never appears, is a problem (judgement, not Google's figure).

**Do not**: use Change of address (only for a new domain); use Removals on old URLs or `nou.`;
create a new property; remove the 301s; click Validate Fix on expected 404s.

## Open questions

Answered 2026-10-23 (owner): now; the owner runs Search Console himself, from steps the `seo`
agent prepares.

- After the switch, does `/` serve `index.html` before WordPress's `index.php` is moved
  (cPanel's `DirectoryIndex` order)? Either way readers see a site; the plan states which.

## Done when

- [ ] every Behaviour line passes, the rehearsal on the preview included
- [ ] `docs/` updated (`workflow.md` cut-over row, `architecture.md` host, `deploy.md`,
  `state.md` cleared of the cut-over)
- [ ] Status set to built
