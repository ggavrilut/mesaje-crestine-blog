# Architecture

How the main pieces and flows hang together. Read before cross-module changes. As of
2026-10-22 nothing is built: this is the agreed design, and each piece is marked as it lands.

## Pieces

- **Astro site** (`src/`), static output only: layouts, pages, components. Reads the content
  collections and renders every page to HTML at build. Not scaffolded yet.
- **Content** (`content/`): posts and authors as Markdown with front matter, schema in
  `content-model.md`, validated by Astro's content collections at build.
- **Search**: Pagefind, an index generated from the built HTML after `astro build`; runs in the
  browser, no server.
- **Redirects**: `.htaccess` generated at build from each post's `legacyUrl` plus a static list
  for non-post URLs (`seo.md`, the move). Apache on the host executes it.
- **Contact form**: the one piece of server code, a small PHP handler on the cPanel host. It
  verifies the Turnstile token server-side, then sends through SMTP from
  `contact@mesaje-crestine.ro` to the owner's Gmail, with `Reply-To` set to the visitor, so
  replying from Gmail answers the visitor. `contact@` is a sender only: the owner does not read
  it, and it is never shown on the site. Recipient and SMTP credentials live in a server-side
  config file, never in git. Turnstile widget "mesaje-crestine.ro contact": hostname
  `mesaje-crestine.ro`, Managed mode, pre-clearance off (it would set a `cf_clearance`
  cookie); site key `0x4AAAAAAFhL6pcNmP1n77El` (public, ships in the page). The secret key
  goes in the server-side config only. Local development uses Cloudflare's published test
  keys. Spec to be written.
- **Analytics**: Google Analytics 4 with Consent Mode v2, denied by default, behind a small
  self-built consent banner; loaded async (`seo.md`, performance). Property `353403051`,
  measurement ID `G-7SDPW1HTQF` (the one the WordPress site loads, 2026-10-22). Both are
  public identifiers, not secrets: the ID ships in every page.
- **WordPress importer**: a one-off script reading the live site's public REST API and pages,
  writing `content/`. Spec: `specs/wordpress-import.md`.
- **Host**: cPanel shared hosting, Apache, reached by FTPS. Receives `dist/`. WordPress lives
  in the same account until cut-over, when it is backed up and removed (`workflow.md`).

## Main flows

1. **New post**: owner → `post-writer` subagent → `content/posts/<slug>/` → build and checks →
   owner reviews → deploy (`workflow.md`).
2. **Build and deploy**: `astro build` → Pagefind index → `.htaccess` generated → `dist/` →
   FTP upload to the host, after a yes.
3. **Import** (once, repeatable until cut-over): WordPress REST API and pages → `content/` and
   the redirect map.

## Surprises

- The author shown on an article is **not** the WordPress user: it is the custom
  `author_taxonomy` (29 names). The WP user is the person who uploaded it.
- Eight 2021–2022 posts have empty `content` in the REST API but render text on the page; the
  importer reads those from the HTML.
- Each post keeps its input as `source.txt` next to `index.md`. It is not a duplicate to clean
  up: it is what the text-integrity check compares against.
