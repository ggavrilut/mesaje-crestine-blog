# Deploy

Status: building · Owner: Gabriel Gavrilut · Last updated: 2026-10-23

## Goal

One script uploads the built site to the host over FTPS, so the owner can review the new
site on the real server before the cut-over: first to a password-protected preview,
`nou.mesaje-crestine.ro`, while WordPress stays live. The live target is added with the
cut-over procedure.

## Non-goals

- Deploying to the live site (`public_html` root) or deleting WordPress: the cut-over gets its
  own procedure (`workflow.md`); the script refuses the live target until then.
- Creating the subdomain or its password: the owner does both in cPanel (Subdomains,
  Directory Privacy); the password never reaches the repo or a chat.

## Behaviour

- [ ] `npm run deploy -- preview` builds from a clean tree, compares `dist/` with what the
  target holds and prints the plan: files to upload, files to delete, bytes, the commit and a
  plan ID. It changes nothing on the server.
- [ ] `npm run deploy -- preview --yes <plan ID>` uploads only if the commit and the build
  still give that plan ID, so a yes covers exactly the plan that was shown (`hard-rules.md`).
- [ ] The script deletes only files that its own previous deploy uploaded (listed in
  `.deploy-manifest.json` on the target); anything else in the folder is never touched.
- [ ] The preview refuses to upload unless the subdomain answers 401 (password-protected).
  Its `.htaccess` keeps cPanel's Directory Privacy lines, adds
  `X-Robots-Tag: noindex, nofollow`, and points the redirects at the preview host.
- [ ] After the upload, the preview still answers 401 and the manifest on the server names
  the deployed commit.
- [ ] `.env` is read with `process.loadEnvFile()`, never by a shell
  (`dev-environment.md`); no secret is printed.

## Data and interfaces

- Reads: `dist/` (built by the script), `.env` (`FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`).
- Target: the FTP account's root is `public_html`; the preview folder is `/nou`
  (`public_html/nou`, served as `nou.mesaje-crestine.ro` and as `mesaje-crestine.ro/nou/`).
- Writes on the server: the site's files, `.htaccess`, `.deploy-manifest.json` (path → SHA-256
  of each uploaded file, the commit, the time).
- Dependency: `basic-ftp` (dev), FTPS with TLS (owner, 2026-10-23).

## Open questions

- None for the preview.

## Done when

- [ ] every Behaviour line passes on the real preview
- [ ] `docs/` updated (`dev-environment.md` commands, `workflow.md` deploy row)
- [ ] Status set to built; `docs/state.md` updated
