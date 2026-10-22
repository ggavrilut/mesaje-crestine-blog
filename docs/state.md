# State

Working memory across sessions. Every agent reads this first, every session. Keep it short: a
resolved item moves to `decisions.md` (the why) or the owning doc (the how) and is deleted
here, so the file never becomes a history.

_Last updated 2026-10-22_

## In flight

- Branch `import-wordpress` (2026-10-22): Astro scaffolded, importer built and run (73 posts,
  26 authors, zero text differences), redirects generated and checked. Not committed yet.
  Remaining for `specs/wordpress-import.md`: its open questions, the `despre-noi` and
  `contact` pages, the post writer's pass (descriptions, cover alt text, related) after the
  last import. Not yet built: search, analytics with the consent banner, contact form, the
  deploy script. The visual design (`specs/visual-design.md`, from the owner's handoff in
  `design/`) is built for home and article pages, checked at 1440 and 390 px; the footer's
  contact form waits for its spec.

## Open questions

- **Contact form config on the server**: the deploy FTP account only reaches `public_html`,
  so the config with the `contact@` SMTP password and the Turnstile secret key cannot sit
  outside it by FTP. Either the owner creates it once in cPanel's File Manager above
  `public_html`, or it goes in a `public_html` folder denied by `.htaccess`. The contact-form
  spec decides. The secrets are typed there by Gabriel, never pasted in a chat.
- **About text** for `/despre-noi/` (`decisions.md`): Gabriel.
- **Lists versus the text check**: `content-model.md` allows turning list-like lines into a
  Markdown list, but the list then drops the input's `-` or `1.` and the build's text check
  fails. Keep the markers as text, or teach the check about lists? Gabriel.
- **Import questions** for the owner and the `seo` agent: `specs/wordpress-import.md`, open
  questions (quote and dailyverse URLs, image URLs, the zip and the PDF,
  the `necunoscut` author).
- **Citation lines not imported**: live posts show a line such as "Meditație de A.B. Simpson
  – 30 Iunie 2023" under the text, from a Bricks field outside the post content; the import
  has none of them (`source` is empty everywhere). Import it into `source`? Owner, then the
  importer.
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
