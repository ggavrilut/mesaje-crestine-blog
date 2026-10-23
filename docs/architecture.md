# Architecture

How the main pieces and flows hang together. Read before cross-module changes. This is the
agreed design; each piece is marked as it lands.

## Pieces

- **Astro site** (`src/`), static output only: layouts, pages, components. Reads the content
  collections and renders every page to HTML at build. Built 2026-10-22 (Astro 7): home,
  `/<slug>/`, `/blog/` and `/blog/page/N/`, `/authors/` and `/authors/<slug>/`, 404,
  `/rss.xml`, `/sitemap-index.xml`, `/robots.txt`. Styling follows the owner's design handoff
  (`specs/visual-design.md`), in `src/styles/global.css`; fonts self-hosted by Astro's Fonts API.
  Markdown goes through Sätteri with smart punctuation and GFM off and one plugin
  (`src/lib/youtube.ts`, video lines). `src/integrations/build-checks.ts` runs after every
  build: the text check, and the `.htaccess` rename. Static files in `public/`: the logo,
  icons and default social card (`decisions.md`, site images).
- **Content** (`content/`): posts and authors as Markdown with front matter, schema in
  `content-model.md`, validated by Astro's content collections at build.
- **Search**: Pagefind, an index generated from the built HTML after `astro build`; runs in the
  browser, no server. Not built yet.
- **Redirects**: `.htaccess` generated at build from each post's `legacyUrl`, the importer's
  `import/redirects.tsv` and the hand-written `src/redirects/static.htaccess` (`seo.md`, the
  move). Apache on the host executes it. Built: `src/pages/htaccess.txt.ts`, checked by
  `bin/check-redirects.ts` (the sitemap's old URLs and every importer redirect).
- **Contact form**: the one piece of server code, a small PHP handler on the cPanel host. It
  verifies the Turnstile token server-side, then sends through SMTP from
  `contact@mesaje-crestine.ro` to the owner's Gmail, with `Reply-To` set to the visitor, so
  replying from Gmail answers the visitor. `contact@` is a sender only: the owner does not read
  it, and it is never shown on the site; mail arriving there is handled by a cPanel rule
  the owner set up (2026-10-22). Recipient and SMTP credentials live in a server-side
  config file, never in git. Turnstile widget "mesaje-crestine.ro contact": hostname
  `mesaje-crestine.ro`, Managed mode, pre-clearance off (it would set a `cf_clearance`
  cookie); site key `0x4AAAAAAFhL6pcNmP1n77El` (public, ships in the page). The secret key
  goes in the server-side config only. Local development uses Cloudflare's published test
  keys. Built 2026-10-23: `public/contact.php`, `src/components/ContactForm.astro`, PHPMailer in
  `public/_lib/`; spec `specs/contact-form.md`.
- **Analytics**: Google Analytics 4 with Consent Mode v2, denied by default, behind a small
  self-built consent banner; loaded async (`seo.md`, performance). Property `353403051`,
  measurement ID `G-7SDPW1HTQF` (the one the WordPress site loads, 2026-10-22). Both are
  public identifiers, not secrets: the ID ships in every page. `gtag.js` loads only on
  `mesaje-crestine.ro`. Built 2026-10-23: the `<head>` script in `src/layouts/Base.astro`,
  `src/components/ConsentBanner.astro`; privacy page `src/pages/confidentialitate.astro`;
  spec `specs/analytics.md`.
- **App (PWA)**: the manifest and service worker at the WordPress app's URLs,
  `/superpwa-manifest.json` (`src/pages/superpwa-manifest.json.ts`) and `/superpwa-sw.js`
  (`public/`), so devices that installed the old app get the new site; the worker deletes
  SuperPWA's cache, keeps the last 40 pages read for offline, shows `/offline/` otherwise.
  Icons `public/app-*.png` from `public/mark.svg`. Built 2026-10-23; spec `specs/pwa.md`.
- **Privacy page** (`/confidentialitate/`): describes exactly what the site processes, never
  what it might. A change that adds a cookie, a third-party request or a new use of data (a
  newsletter, say) updates it in the same commit, before going live. A new cookie purpose gets
  its own switch in the banner, off by default (the stored choice is keyed by purpose,
  `{"analytics": …}`); a newsletter gets its own sign-up consent (double opt-in), its provider
  named on the page, and an unsubscribe link in every email.
- **WordPress importer**: a one-off script reading the live site's public REST API and pages,
  writing `content/` and `import/`. Built: `bin/import-wp.ts`. Spec: `specs/wordpress-import.md`.
- **Host**: cPanel shared hosting, Apache, reached by FTPS. `public_html` receives `dist/`
  (`npm run deploy -- live`). Since the cut-over (2026-10-23) WordPress's files sit closed in
  `public_html/_wordpress/` until deleted; its database stays on the host
  (`specs/cutover.md`). HTTP and `www` are redirected by the host, not by `.htaccess`.

## Main flows

1. **New post**: owner → `post-writer` subagent → `content/posts/<slug>/` → build and checks →
   owner reviews → deploy (`workflow.md`).
2. **Build and deploy**: `astro build` → Pagefind index → `.htaccess` generated → `dist/` →
   FTP upload to the host, after a yes.
3. **Import** (once, repeatable until cut-over): WordPress REST API and pages → `content/` and
   the redirect map.

## Surprises

- The author shown on an article is **not** the WordPress user: it is the custom
  `author_taxonomy` (32 terms on 2026-10-22). The WP user is the person who uploaded it.
- Ten posts are rendered by the Bricks template's own text elements, not from `content`:
  eight have empty `content` in the REST API, one has only part of its text there, one all of it. The
  importer reads a post from its HTML whenever the page has no `post-content` element.
- Each post keeps its input as `source.txt` next to `index.md`. It is not a duplicate to clean
  up: it is what the text-integrity check compares against.
