# App (PWA)

Status: draft · Owner: Gabriel Gavrilut · Last updated: 2026-10-23

## Goal

Readers who installed the WordPress site as an app (SuperPWA) keep their app after cut-over
and get the new site in it, with the new name and icon, instead of a broken app or old pages
from its cache. New readers can install the site the same way, and articles they have read
open without a connection. Decided: `decisions.md`, 2026-10-23 next work (short name
"Mesaje Creștine", the new mark, standalone display, the old manifest and service-worker
URLs and `start_url` kept).

## Non-goals

- Push notifications, background sync, an app-store listing.
- Offline reading of articles the reader never opened; precaching the whole site.
- An install button or prompt of our own: the browser's install offer is enough.

## The old app (read 2026-10-23)

`/superpwa-manifest.json`: name "Mesaje Creștine", short name "EkkBlog", `start_url` and
`scope` `/`, no `id` (so the app's identity is `/`), `display` fullscreen, portrait, teal
theme, icons from `/wp-content/uploads/2021/10/`. `/superpwa-sw.js`, scope `/`: caches every
same-site GET cache-first with no expiry (pages network-first while online), in the cache
`mesaje-crestine.ro-superpwa-2.1.16`; it never deletes that cache by itself. So after
cut-over, until it is replaced, an installed app would serve stale copies of any file whose
URL did not change (icons, the manifest, `rss.xml`).

## Behaviour

- [ ] `/superpwa-manifest.json` is the new site's manifest: `id` and `start_url` `/`, `scope`
  `/`, name and short name "Mesaje Creștine", `display` standalone, `lang` ro, theme
  `#f3f6f5` (the header, so the status bar blends in), background `#fbfcfb` (the page);
  icons 192 and 512 px PNG, plus a 512 px maskable one, rendered from `public/mark.svg`.
  Every page links it; Chrome reports no installability error.
- [ ] `/superpwa-sw.js` is the new service worker, scope `/`, registered by every page after
  load. Installed over the old one, it activates at once, deletes every cache that is not
  its own (SuperPWA's included) and takes over open pages: from the reader's second page
  view on, nothing comes from the old cache.
- [ ] Pages (navigations): network first; a page that loaded is kept for offline, at most
  the last 40; offline, a kept page opens, any other shows `/offline/` (a short page saying
  the reader is offline, with a link to the home page; noindex, not in the sitemap).
- [ ] Hashed build files (`/_astro/…`): cache first, kept while a kept page uses them.
  Everything else same-site (icons, `rss.xml`, the manifest, `contact.php`, the PDF): network
  only, never cached. Other sites (Google Analytics, Turnstile, YouTube): never touched.
- [ ] `.htaccess` serves `/superpwa-sw.js` and `/superpwa-manifest.json` with
  `Cache-Control: no-cache`, so a new version reaches readers on their next visit.
- [ ] The privacy page says that read pages are kept in the browser for offline reading,
  only on the reader's device (`architecture.md`, privacy page).

## Data and interfaces

- **Files**: `src/pages/superpwa-manifest.json.ts` (built from `site.ts` constants);
  `public/superpwa-sw.js` (plain JavaScript, a version string bumped by the build so each
  deploy is a new worker); `src/pages/offline.astro`; the icons `public/app-192.png`,
  `public/app-512.png`, `public/app-512-maskable.png`, rendered once from `public/mark.svg`
  with sharp and committed (the owner's mark is the source; no generator stays in the repo,
  `decisions.md`, brand images); the registration and `<link rel="manifest">` in
  `Base.astro`.
- **Stored on the reader's device**: the service worker's cache (pages read, their build
  files), no cookie, nothing sent anywhere.
- **Test**: Playwright, the build served as `https://mesaje-crestine.ro` (as in
  `specs/analytics.md`): first install the live `superpwa-sw.js` with a page, fill its
  cache; then switch the route to `dist/` and navigate: the new worker controls the page,
  the SuperPWA cache is gone, the new icon and manifest are served; offline, a read article
  opens and an unread one shows `/offline/`; Chrome's installability check (CDP
  `Page.getInstallabilityErrors`) is empty. On a phone after cut-over, the owner's own
  installed app shows the new site.

## Open questions

- `/offline/` text: drafted at build, owner approves.

Answered 2026-10-23 (owner): the colours above and no portrait lock.

## Done when

- [ ] every Behaviour line passes and the test that proves it exists
- [ ] `docs/` updated (`architecture.md` PWA, `testing.md` a row, the privacy page)
- [ ] goes live at cut-over; the owner's installed app checked on a phone
- [ ] Status set to built; `docs/state.md` cleared of this feature
