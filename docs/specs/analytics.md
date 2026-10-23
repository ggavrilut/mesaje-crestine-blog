# Analytics

Status: built · Owner: Gabriel Gavrilut · Last updated: 2026-10-23

## Goal

The owner keeps seeing visits, time per visit, pages and sources in the existing GA4 property
(`architecture.md`, analytics), with its history, on the new site. Readers are asked once, in
a small banner, whether analytics cookies may be set, can refuse as easily as accept, and can
change their mind from a "Setări cookie" link in the footer of every page. Decided:
`decisions.md`, 2026-10-22 analytics and 2026-10-23 next work (Consent Mode v2 "advanced").

## Non-goals

- Google Tag Manager, ads, remarketing, any other tracker or pixel.
- A consent platform or the IAB TCF framework: one purpose (analytics), one switch.
- Custom events: GA4's defaults and its enhanced measurement only (page views, scrolls,
  outbound clicks, file downloads such as the PDF of `o-mantuire-asa-de-mare`).
- Consent for Turnstile (no cookie, `architecture.md`) and YouTube (click-to-load, through
  `youtube-nocookie.com`): neither sets a cookie before the reader acts.
- The privacy page itself: its own draft, next in `state.md`; this spec only links it.

## Behaviour

- [x] Every page's `<head>` sets the consent defaults before anything else of Google's runs:
  `analytics_storage`, `ad_storage`, `ad_user_data` and `ad_personalization` denied, then
  loads `gtag.js?id=G-7SDPW1HTQF` with `async`. Until consent, GA4 receives cookieless pings
  (Consent Mode "advanced") and no `_ga` cookie exists.
- [x] A stored choice is applied before `gtag.js` sends its first hit: a reader who accepted
  earlier is counted with cookies from the first page view of the visit.
- [x] A reader with no stored choice sees the banner fixed at the bottom of the viewport,
  over the page, not moving it (CLS 0, `seo.md`, performance), and smaller than any first-
  viewport image or heading, so it is never the LCP element. Text and buttons below.
- [x] "Accept" and "Refuz" are two buttons of the same size and style, side by side; neither
  is preselected or highlighted. Closing is only by choosing.
- [x] Accept: `analytics_storage` granted, the choice stored, the banner gone; GA4 sets its
  `_ga` cookies. Refuz: everything stays denied, the choice stored, the banner gone.
- [x] The banner does not block reading: no overlay over the page, no focus trap; it is a
  labelled region (`aria-label`), its buttons reachable by keyboard after the main content.
- [x] "Setări cookie" in the footer bar of every page reopens the banner, showing the current
  choice. Changing from accepted to refused updates consent to denied and deletes the `_ga`
  and `_ga_7SDPW1HTQF` cookies.
- [x] The choice is stored in `localStorage` (`mc-consent`: the choice and its date), not in a
  cookie; the banner reappears 6 months after the choice, and whenever storage is unavailable
  (private windows), without breaking the page.
- [x] Only on `mesaje-crestine.ro`: on any other host (the preview, `localhost`), `gtag.js` is
  not loaded and nothing is sent; the banner and the footer link work the same.
- [x] Without JavaScript: no banner, no `gtag.js`, nothing sent, the page unchanged.
- [x] GA4 sends no ads signals: `ads_data_redaction` on; Google signals and ads personalisation
  off in the property (owner, in GA4 Admin).

### Banner text (Romanian, for the owner to approve)

> Folosim Google Analytics ca să vedem câte persoane citesc articolele și cum ajung la ele.
> Cookie-urile de analiză se pun doar dacă acceptați. Detalii
>
> [Accept] [Refuz]

"Detalii" links to `/confidentialitate/`. Footer link: **Setări cookie**.

## Data and interfaces

- **Files**: `src/components/ConsentBanner.astro` (markup, styles, the island's script);
  the consent defaults and the `gtag.js` tag inline in `src/layouts/Base.astro`'s `<head>`;
  the footer link in `Base.astro`. The ID `G-7SDPW1HTQF` once, in `src/lib/site.ts`.
- **Client JS**: one small inline script in `<head>` (defaults, stored choice, host check)
  and the banner's script; justified by the consent requirement (`seo.md`, no client JS by
  default).
- **Stored**: `localStorage["mc-consent"]` = `{"analytics":"granted"|"denied","at":"<ISO date>"}`.
  GA4's own cookies after consent: `_ga`, `_ga_7SDPW1HTQF` (up to 2 years, set by Google).
- **Sent to Google**: page URL, title, referrer, screen size, language; with consent also the
  `_ga` client ID. GA4 does not store IP addresses. Data retention: the property's setting.
- **Privacy page**: `/confidentialitate/`, linked from the banner; it must describe exactly
  the above, and goes live with or before analytics.
- **Test**: Playwright against the local build, served as `https://mesaje-crestine.ro` by
  routing requests to `dist/`, with Google's endpoints intercepted (nothing reaches GA): the
  collect requests carry `gcs=G100` before consent and `G101` after (`G1`, then ad and
  analytics storage); no `_ga` cookie before Accept or after Refuz; the banner adds no layout
  shift and is never the LCP element, at 390 and 1440 px.

## Open questions

- None. The operator named on the privacy page is Gabriel Gavrilut (`decisions.md`,
  2026-10-23).

Answered 2026-10-23 (owner): the banner text, the 6-month re-ask and "Setări cookie" are
approved, with "acceptați" for "accepți" to match the site's "dumneavoastră"; analytics and
the banner go live together with the privacy page, not before. The
privacy page is drafted at `/confidentialitate/` (`src/pages/confidentialitate.astro`), in
the footer and the sitemap, for the owner's review before it goes live. GA4 Admin set by the
owner: Google signals off, ads personalisation off in all regions, event data retention 14
months, email redaction on, no Google Ads link; enhanced measurement all on.

## Results

2026-10-23, the local build served as `https://mesaje-crestine.ro` in Playwright, Google's
collect endpoint intercepted (nothing reached GA), fresh browser contexts: first visit, the
banner shows, one `page_view` with `gcs=G100`, no cookie; Accept sets `_ga` and
`_ga_7SDPW1HTQF` on `.mesaje-crestine.ro`, and the next page view carries `G101` with no
banner; "Setări cookie" reopens it reading "Acum: acceptat."; Refuz deletes both cookies and
the next page view is `G100` again. A choice 200 days old shows the banner, 170 days old does
not; blocked or corrupt storage shows the banner with no script error. On `localhost`, no
request to Google even after Accept; without JavaScript, no banner, no footer button, no
request. The banner's buttons are the last focusable elements of the page. Layout shift on
`kenosis` at 390 px is 0.016 with the banner and 0.016 without (the article's font swap, not
the banner); at 1440 px 0.0007 both ways; the LCP element is always the article text or the
cover, never the banner. Found on the way: the test browser had cached the live site's 301
from `/kenosis/` to `/2023/02/kenosis/` and silently tested the 404 page; fresh contexts fix
it.

## Done when

- [x] every Behaviour line passes and the test that proves it exists
- [x] `docs/` updated wherever the feature changed a rule, a flow or a command
  (`architecture.md` analytics "built", `testing.md` a row for the consent test)
- [ ] goes live with the privacy page, then checked on the live site in GA4's Realtime report
- [ ] Status set to built; `docs/state.md` cleared of this feature
