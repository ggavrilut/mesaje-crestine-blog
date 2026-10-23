# App (PWA)

Status: built · Owner: Gabriel Gavrilut · Last updated: 2026-10-23

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

- [x] `/superpwa-manifest.json` is the new site's manifest: `id` and `start_url` `/`, `scope`
  `/`, name and short name "Mesaje Creștine", `display` standalone, `lang` ro, theme
  `#f3f6f5` (the header, so the status bar blends in), background `#fbfcfb` (the page);
  icons 192 and 512 px PNG, plus a 512 px maskable one, rendered from `public/mark.svg`.
  Every page links it; Chrome reports no installability error.
- [x] `/superpwa-sw.js` is the new service worker, scope `/`, registered by every page after
  load. Installed over the old one, it activates at once, deletes every cache that is not
  its own (SuperPWA's included) and takes over open pages: from the reader's second page
  view on, nothing comes from the old cache.
- [x] Pages (navigations): network first; a page that loaded is kept for offline, at most
  the last 40; offline, a kept page opens, any other shows `/offline/` (a short page saying
  the reader is offline, with a link to the home page; noindex, not in the sitemap).
- [x] Hashed build files (`/_astro/…`): cache first, at most the last 150 kept.
  Everything else same-site (icons, `rss.xml`, the manifest, `contact.php`, the PDF): network
  only, never cached. Other sites (Google Analytics, Turnstile, YouTube): never touched.
- [x] `.htaccess` serves `/superpwa-sw.js` and `/superpwa-manifest.json` with
  `Cache-Control: no-cache`, so a new version reaches readers on their next visit.
- [x] The privacy page says that read pages are kept in the browser for offline reading,
  only on the reader's device (`architecture.md`, privacy page).

## Data and interfaces

- **Files**: `src/pages/superpwa-manifest.json.ts` (built from `site.ts` constants);
  `public/superpwa-sw.js` (plain JavaScript; its `VERSION` changes by hand whenever its
  behaviour does, which drops the old caches: pages are network first and build files are
  hashed, so a deploy alone needs no new worker); `src/pages/offline.astro`; the icons `public/app-192.png`,
  `public/app-512.png`, `public/app-512-maskable.png`, rendered once from `public/mark.svg`
  with sharp and committed (the owner's mark is the source; no generator stays in the repo,
  `decisions.md`, brand images); the registration and `<link rel="manifest">` in
  `Base.astro`.
- **Stored on the reader's device**: the service worker's cache (pages read, their build
  files), no cookie, nothing sent anywhere.
- **Test**: Playwright against a small local server on `localhost` that first serves the
  saved live `superpwa-sw.js` with a stub page, then `dist/` (request interception cannot be
  used: the browser fetches worker updates itself, past it, and offline mode ignores it):
  install the old worker, fill its cache; switch the server and navigate: the new worker controls the page,
  the SuperPWA cache is gone, the new icon and manifest are served; offline, a read article
  opens and an unread one shows `/offline/`; Chrome's installability check (CDP
  `Page.getInstallabilityErrors`) is empty. On a phone after cut-over, the owner's own
  installed app shows the new site.

## Results

2026-10-23, local server as above, Chromium: before the switch the SuperPWA worker controls
the page with its cache `mesaje-crestine.ro-superpwa-2.1.16` and the old favicon; at the
first page view of the new site that cache is gone (only `mc-1-pages`); at the second the
new worker is active and in control, the favicon is the new one, `/offline/` and the page
read are kept. Offline: the article read opens; an unread one, and the home page first loaded
under the old worker, show `/offline/`. The manifest has no errors; Chrome's installability
check reports only "in-incognito" (the test's private context). Found on the way: a first
attempt with request interception tested nothing, since the update check went to the live
site's unchanged worker.

## Open questions

- None. Approved 2026-10-23 (owner): the `/offline/` text and the privacy page's lines on
  pages kept for offline reading.

Answered 2026-10-23 (owner): the colours above and no portrait lock.

## Done when

- [x] every Behaviour line passes and the test that proves it exists
- [x] `docs/` updated (`architecture.md` PWA, `testing.md` a row, the privacy page)
- [ ] goes live at cut-over; the owner's installed app checked on a phone
- [ ] Status set to built; `docs/state.md` cleared of this feature
