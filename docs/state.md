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
  last import. Not yet built: search, analytics with the consent banner, contact form, the
  deploy script. The visual design (`specs/visual-design.md`, from the owner's handoff in
  `design/`) is built for home and article pages, checked at 1440 and 390 px; the footer's
  contact form waits for its spec. Preview deploy (`specs/deploy.md`) built 2026-10-23, to
  password-protected `nou.mesaje-crestine.ro`; first upload done (commit `3ed51db`): Gabriel reviews it. Contact form
  (`specs/contact-form.md`) built and working on the preview (a real message sent and
  answered, 2026-10-23).

## Next session (2026-10-23)

- **New brand images** (owner replaced the files in `public/`, 2026-10-23): the JSON-LD
  Organization logo now points at `/logo.svg` (640×160), built and checked; uncommitted. To
  do, asked by Gabriel, none started: (1) copy `public/mark.svg` over `src/brand/mark.svg`,
  so `bin/make-brand-images.ts` stops regenerating the old teal "MC" icons over the new ones
  (don't run the script until then); (2) convert the `<text>` in `public/logo.svg`
  (Roboto 300, letter-spacing 4.76) to outlines, so it renders the same without the font;
  (3) run the Rich Results Test and the Schema.org validator on a built page (the preview is
  password-protected: paste the code). Pending owner answers: delete the unused
  `public/logo.png`? Use the new logo image in the header in place of the text name?
- **Uncommitted**: the changed and new files in `public/`, `src/layouts/Base.astro` and the
  logo line of `decisions.md` belong to the brand images item above: their own commit.
- **Then, in order** (`decisions.md`, 2026-10-23 next work): the post-writer pass for the
  73 descriptions; the analytics spec and build (with the consent banner and a "cookie
  settings" link); the privacy page draft; the PWA spec and build.

## Open questions

- **About text** for `/despre-noi/` (`decisions.md`): Gabriel.
- **Lists versus the text check**: `content-model.md` allows turning list-like lines into a
  Markdown list, but the list then drops the input's `-` or `1.` and the build's text check
  fails. Keep the markers as text, or teach the check about lists? Gabriel.
- **Import questions** for the owner and the `seo` agent: `specs/wordpress-import.md`, open
  questions (quote and dailyverse URLs, image URLs, the zip and the PDF,
  the `necunoscut` author).
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
