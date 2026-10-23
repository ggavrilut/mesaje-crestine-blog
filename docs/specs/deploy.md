# Deploy

Status: built · Owner: Gabriel Gavrilut · Last updated: 2026-10-23

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

- [x] `npm run deploy -- preview` builds from a clean tree, compares `dist/` with what the
  target holds and prints the plan: files to upload, files to delete, bytes, the commit and a
  plan ID. It changes nothing on the server.
- [x] `npm run deploy -- preview --yes <plan ID>` uploads only if the commit and the build
  still give that plan ID, so a yes covers exactly the plan that was shown (`hard-rules.md`).
- [x] The script deletes only files that its own previous deploy uploaded (listed in
  `.deploy-manifest.json` on the target); anything else in the folder is never touched.
- [ ] The preview refuses to upload unless the subdomain answers 401 (password-protected).
  Its `.htaccess` keeps cPanel's Directory Privacy lines, adds
  `X-Robots-Tag: noindex, nofollow`, and points the redirects at the preview host.
- [x] After the upload, the preview still answers 401 and the manifest on the server names
  the deployed commit.
- [x] `.env` is read with `process.loadEnvFile()`, never by a shell
  (`dev-environment.md`); no secret is printed.

## Data and interfaces

- Reads: `dist/` (built by the script), `.env` (`FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`).
- Target: the FTP account's root is `public_html`; the preview folder is `/nou`
  (`public_html/nou`, served as `nou.mesaje-crestine.ro` and as `mesaje-crestine.ro/nou/`).
- Writes on the server: the site's files, `.htaccess`, `.deploy-manifest.json` (path → SHA-256
  of each uploaded file, the commit, the time).
- Dependency: `basic-ftp` (dev), FTPS with TLS (owner, 2026-10-23).

## Results

2026-10-23: the preview did its job and was removed at the cut-over with `nou/` and its
subdomain; the script now deploys `live` (`specs/cutover.md`), and `preview` would fail its 401
check. The live deploys after the switch are normal plans, as the preview's were.


2026-10-23, first preview deploy: the dry run gave plan `6e6f11617ea5` (commit `3ed51db`,
1,046 files, 118.5 MB, nothing to delete); a wrong plan ID was refused before any upload; the
approved plan uploaded, the manifest on the server names `3ed51db`, and every preview path,
the manifest included, answers 401. Second deploy (`8c5a330`, plan `b51731d79720`): 120
files uploaded, the replaced stylesheet deleted and confirmed gone over FTP. Not yet exercised
on the server: the refusal of an unprotected preview.

Through the main domain, `mesaje-crestine.ro/nou/` answers WordPress's 404 page with the
password challenge: WordPress catches the 401. No preview file is served that way. It ends
with WordPress; the `/nou` folder is removed at cut-over.

## Open questions

- None for the preview.

## Done when

- [ ] every Behaviour line passes on the real preview
- [ ] `docs/` updated (`dev-environment.md` commands, `workflow.md` deploy row)
- [ ] Status set to built; `docs/state.md` updated
