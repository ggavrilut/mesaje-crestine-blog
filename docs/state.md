# State

Working memory across sessions. Every agent reads this first, every session. Keep it short: a
resolved item moves to `decisions.md` (the why) or the owning doc (the how) and is deleted
here, so the file never becomes a history.

_Last updated 2026-10-22_

## In flight

- Agent setup done (three agents, docs, evals). Next: the owner reviews
  `specs/wordpress-import.md`, then the developer scaffolds Astro and builds the importer.

## Open questions

- **Contact form config on the server**: the deploy FTP account only reaches `public_html`,
  so the config with the `contact@` SMTP password and the Turnstile secret key cannot sit
  outside it by FTP. Either the owner creates it once in cPanel's File Manager above
  `public_html`, or it goes in a `public_html` folder denied by `.htaccess`. The contact-form
  spec decides. The secrets are typed there by Gabriel, never pasted in a chat.
- **Mail to `contact@`**: bounces and stray mail will collect there unread. A cPanel
  forwarder to the owner's Gmail, or a filter that discards it? Gabriel.
- **Bing Webmaster Tools**: not set up as far as known; it can import the site from Search
  Console. The `seo` agent proposes it at cut-over.

## Candidates

Lessons or proposals without an incident yet; not rules.

- A text-integrity script in `bin/` comparing each post's body with its `source.txt`
  (`content-model.md`), and a hook running it after the post writer edits a post.
- An SEO lint of `dist/` run by `bin/check` after a build (`testing.md`).

## Declined proposals

Not re-proposed without new evidence.

- 2026-10-22 Keeping the `/YYYY/MM/<slug>/` URLs: declined, the owner prefers `/<slug>/`
  with 301s.
- 2026-10-22 A git-based CMS for other authors: declined, posts go through the post writer.
- 2026-10-22 Mailjet for the contact form: not needed, the host's own mail is authenticated.
- 2026-10-22 reCAPTCHA: replaced by Turnstile (Google cookies that EU regulators treat as
  needing consent).

## Scheduled checks

None.
