# Contact form

Status: built · Owner: Gabriel Gavrilut · Last updated: 2026-10-23

## Goal

Readers can write to the owner from the footer of every page and from `/contact/`, as they
can on WordPress today. The message reaches the owner's Gmail, and replying there answers the
reader. The form is the design handoff's footer column (`specs/visual-design.md`); the server
side is the one piece of PHP on the host (`architecture.md`, contact form).

## Non-goals

- Storing messages on the server, a database, an admin page, or newsletter sign-up.
- Rate limiting beyond Turnstile: added only if spam gets through.
- The phone field of the WordPress form: the handoff drops it.

## Behaviour

- [x] The footer of every page has the handoff's form: label CONTACT, Nume, Email, Mesaj,
  Trimite. `/contact/` has a heading, the same form, and a 200 (it is an old URL,
  `seo.md`; today it fails `check-redirects`).
- [x] No third-party script loads with the page: Turnstile's script loads when the reader
  first focuses a field of the form (`seo.md`, performance).
- [x] Trimite sends the form with `fetch` to `/contact.php`. Success: the button reads
  "Mulțumim!" and the fields empty. Failure: a Romanian message under the button, the fields
  kept. Without JavaScript the form shows a note instead of failing silently.
- [x] `contact.php` accepts only POST; checks the Turnstile token with Cloudflare's
  siteverify; rejects a filled hidden honeypot field; requires a name of 1–100 characters,
  a valid email, a message of 1–5,000 characters; removes line breaks from name and email.
- [x] It sends one plain-text UTF-8 email through SMTP (`titan.solutiiweb.com`, 465, SSL) from
  `contact@mesaje-crestine.ro` to the owner's address, `Reply-To` the reader, subject
  "Mesaj de pe mesaje-crestine.ro: <name>", with the page it was sent from.
- [x] It answers JSON (`{ "ok": true }` or `{ "error": "…" }`) and never shows a secret, a
  path or a library error to the reader; details go to the server's error log.
- [x] A short note under the form says what the data is used for (reply only, not stored).

## Data and interfaces

- **Config on the server, outside `public_html`**: `~/mesaje-crestine-contact.php`, created
  once by the owner in cPanel's File Manager from the template in `dev-environment.md`
  (recipient address, SMTP password, Turnstile secret). `contact.php` finds it by walking up
  from its own folder, so the preview (`public_html/nou`) and the live site read the same file.
  No secret is in git, in `dist/`, on FTP or in a chat.
- **Files deployed**: `public/contact.php`; PHPMailer 7.1.1 (LGPL-2.1, three files and its
  licence) in `public/_lib/phpmailer/`, with an `.htaccess` denying all web access to `_lib/`.
- **Turnstile**: widget "mesaje-crestine.ro contact", site key in `architecture.md`, Managed
  mode, pre-clearance off (no cookie). Local development uses Cloudflare's test keys.
- **Local test**: `php -S` serving `dist/` with a test config (test keys, SMTP pointed at a
  local catcher); nothing is sent.

## Results

2026-10-23, locally (Cloudflare test keys, a local SMTP catcher, PHP 8.5): every Behaviour
line passed (`testing.md`, contact form). Found and fixed on the way: PHP 8.5 deprecates
`curl_close()`, and its notice broke the JSON and the status code; the handler now turns
`display_errors` off itself, so no notice or path reaches a reader on any host.

On the preview (commit `8c5a330`): the owner's config in the cPanel home folder, one real
message sent from the footer, received in Gmail, answered with Reply; no `error_log` on the
server afterwards. `_lib/` answers 403 even before the password prompt. An `error_log`
file is denied site-wide by the generated `.htaccess`.

## Open questions

- None. Answered on the preview, 2026-10-23: the Turnstile widget accepts
  `nou.mesaje-crestine.ro` without a hostname change, and the host's PHP runs `contact.php`.

## Done when

- [x] every Behaviour line passes locally (test keys, nothing sent) and on the preview, where
  the owner sends one real message and replies to it from Gmail
- [x] `check-redirects` no longer fails on `/contact/`
- [x] `docs/` updated (`architecture.md`, `dev-environment.md` config template, `state.md`
  open question closed); status set to built (2026-10-23)
