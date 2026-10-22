# Dev environment

How to run it: runtime, env files, scripts. Read before running anything. Say what each
command does and what "working" looks like, so a failure is recognised as one.

The Astro site is not scaffolded yet (2026-10-22); its rows are added in the scaffold commit.
Runtime on the owner's machine: Node 24, npm 11.

| Task | Command | Expect |
|---|---|---|
| Fast check | `bin/check` | every line `ok` |

Env files: a git-ignored `.env` at the root, copied from `.env.example`: `FTP_HOST`,
`FTP_USER`, `FTP_PASSWORD`, `FTP_REMOTE_DIR`, and the contact form's `TURNSTILE_SECRET_KEY`
and `SMTP_PASSWORD` (the `contact@` mailbox), which reach the server's config file as the
contact-form spec decides.

SMTP for the contact form: `titan.solutiiweb.com`, port 465 (SSL), user
`contact@mesaje-crestine.ro`; login checked without sending on 2026-10-22. Same certificate
trap as FTPS: connect to `titan.solutiiweb.com`, not the domain. Values come from the owner's cPanel; this file
never holds them. The GA4 ID is public and lives in `architecture.md`.

FTPS: the host accepts explicit TLS on port 21 (TLS 1.2, checked 2026-10-22), but its
certificate is for `titan.solutiiweb.com`, not the domain: connect to that name, or
certificate verification fails. Deploy with a dedicated FTP account restricted to
`public_html`, never the main cPanel login, which controls the whole hosting account.

The deploy account exists (`deploy@mesaje-crestine.ro`, login checked read-only on
2026-10-22): its root `/` is `public_html`, which still holds WordPress. Besides WordPress it
contains `.well-known/` (domain validation for cPanel's automatic SSL renewal) and
`.ftpquota` (the host's quota file). **A deploy never deletes either**, or the certificate
stops renewing.
