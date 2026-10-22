# Dev environment

How to run it: runtime, env files, scripts. Read before running anything. Say what each
command does and what "working" looks like, so a failure is recognised as one.

Runtime: Node 24 (it runs the `bin/*.ts` scripts directly, no build step), npm 11. Astro 7.

| Task | Command | Expect |
|---|---|---|
| Install | `npm install` | `found 0 vulnerabilities` |
| Fast check | `bin/check` | every line `ok` |
| Dev server | `npm run dev` | `http://localhost:4321/`; pages rebuild on save |
| Type check | `npm run check` | `0 errors, 0 warnings` |
| Build | `npm run build` | `text integrity: N posts equal their source.txt`, then `Complete!`; output in `dist/` with `.htaccess` |
| Preview the build | `npm run preview` | `dist/` served on `http://localhost:4321/` (no `.htaccess`: redirects are checked by the next row) |
| Redirect check | `npm run check-redirects` (after a build) | one line of counts; every `FAIL` is an old URL that would be lost |
| Icons and social card | `node bin/make-brand-images.ts` | `public/favicon.*`, `apple-touch-icon.png`, `og-default.png` rewritten from `src/brand/mark.svg`; look at the card's `ș ț` |
| WordPress import | `npm run import` | `problems 0, text differences 0`; details in `import/report.md`. Reads the live site only; overwrites imported posts' `index.md` |

The first build takes about 4 minutes, almost all of it AVIF encoding of the covers; later
builds reuse the cache in `node_modules/.astro/` and take seconds. The build downloads the
Roboto and Source Serif 4 files from Google Fonts (`astro.config.ts`, `fonts`) and serves them from
`dist/_astro/fonts/`; visitors never contact Google.

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
