# State

Working memory across sessions. Every agent reads this first, every session. Keep it short: a
resolved item moves to `decisions.md` (the why) or the owning doc (the how) and is deleted
here, so the file never becomes a history.

_Last updated 2026-10-23_

## In flight

- **Live since 2026-10-23** (`specs/cutover.md`): mesaje-crestine.ro serves the new site from
  `main` (commit `a8311ae`); every old URL answers as planned (`check-redirects --live`, 228,
  0 not as expected). WordPress's files are closed in `public_html/_wordpress/`; its database
  stays on the host. The preview `nou/` and its subdomain are gone.
- **Owner's checks after the switch**, not yet reported: a contact-form message arrives; GA4
  Realtime shows a visit after Accept; the installed app shows the new site; Search Console
  done from the steps in `specs/cutover.md` (sitemap submitted, old sitemaps removed, five old
  URLs inspected), then the weekly check for four weeks.
- **Delete `_wordpress/` on or after 2026-11-06** if nothing is open: its own plan and yes.
  Until then `npm run deploy -- live --rollback` puts WordPress back.
- **`/publish` and the publisher agent** still say the deploy script is not built: connect
  them to `npm run deploy -- live` (`specs/publish-pipeline.md`; an agent change, so
  `agent/design.md` and the evals first).
- Not blocking, from before: the post writer's `coverAlt` and `related` for the imported
  posts and the three quotes' descriptions; search; Bing Webmaster Tools (the `seo` agent
  proposes it now).

## Open questions

- **Suspected typos** in about 60 posts, found by the post writer (2026-10-23):
  `import/suspected-typos.md`. Owner decides each; agents change no word.
- **Lists versus the text check**: `content-model.md` allows turning list-like lines into a
  Markdown list, but the list then drops the input's `-` or `1.` and the build's text check
  fails. Keep the markers as text, or teach the check about lists? Gabriel.
- **Excerpts**: the live lists show WordPress's excerpts, often hand-picked from mid-article;
  the new site shows the first words (40 featured, 24 in lists). Import the hand-picked ones?
  The handoff shows such passages too. Owner.
- **Bing Webmaster Tools**: not set up as far as known; it can import the site from Search
  Console. The `seo` agent proposes it at cut-over.

## Candidates

Lessons or proposals without an incident yet; not rules.

- A hook running the build's text check after the post writer edits a post
  (`content-model.md`, the check).
- An SEO lint of `dist/` run by `bin/check` after a build (`testing.md`).
- Cap stored originals at 2400 px wide when a post or the import saves them: the build
  serves optimised copies anyway, and an 8 MB original stays in git history forever.

## Declined proposals

Not re-proposed without new evidence.

- 2026-10-23 The new logo image in the header in place of the text name: declined by the
  owner.
- 2026-10-23 Deleting `src/brand/mark.svg`, which nothing reads since the generator went:
  declined by the owner; it stays as the mark's source copy.
- 2026-10-22 Keeping the `/YYYY/MM/<slug>/` URLs: declined, the owner prefers `/<slug>/`
  with 301s.
- 2026-10-22 A git-based CMS for other authors: declined, posts go through the post writer.
- 2026-10-22 Mailjet for the contact form: not needed, the host's own mail is authenticated.
- 2026-10-22 A report-only proofreader phase: declined by the owner; the post writer keeps
  flagging typos.
- 2026-10-22 reCAPTCHA: replaced by Turnstile (Google cookies that EU regulators treat as
  needing consent).

## Scheduled checks

None.
