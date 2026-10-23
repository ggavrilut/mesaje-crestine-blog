# State

Working memory across sessions. Every agent reads this first, every session. Keep it short: a
resolved item moves to `decisions.md` (the why) or the owning doc (the how) and is deleted
here, so the file never becomes a history.

_Last updated 2026-10-23_

## In flight

- Branch `import-wordpress` (2026-10-22): Astro scaffolded, importer built and run (73 posts,
  26 authors, zero text differences), redirects generated and checked. Not committed yet.
  Remaining for `specs/wordpress-import.md`: its open questions, the `despre-noi` and
  `contact` pages, the post writer's pass (descriptions, cover alt text, related) after the
  last import. Not yet built: search, the
  deploy script. The visual design (`specs/visual-design.md`, from the owner's handoff in
  `design/`) is built for home and article pages, checked at 1440 and 390 px; the footer's
  contact form waits for its spec. Preview deploy (`specs/deploy.md`) built 2026-10-23, to
  password-protected `nou.mesaje-crestine.ro`; latest upload 2026-10-23, commit `a7cde17` (plan `c7a0cfb89f10`, 127 files), reviewed by Gabriel: all good. Contact form
  (`specs/contact-form.md`) built and working on the preview (a real message sent and
  answered, 2026-10-23).

## Next session (2026-10-23)

- **Analytics and the privacy page**: built, tested locally and owner-approved 2026-10-23
  (`specs/analytics.md`, results). They go live with the new site at cut-over (gtag.js loads
  only on `mesaje-crestine.ro`, so the preview sends nothing); then a check in GA4 Realtime.
- **Cut-over** (owner asked 2026-10-23 "when can it go live?"). Blocking: (1) done
  2026-10-23: every old URL has a rule (`check-redirects` 0 failing); (2) done 2026-10-23: the PWA
  (`specs/pwa.md`, built, tested locally, texts approved) ships at
  cut-over, replacing the SuperPWA worker that caches same-site files forever; (3) the cut-over procedure (spec and
  build; the deploy script refuses the live target until then; WordPress's database stays on
  the host, `decisions.md`); (4) merge `import-wordpress` into
  `main`. Not blocking: `coverAlt` and `related` (the rest of the post writer's pass),
  typos, excerpts, Bing, search.

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
