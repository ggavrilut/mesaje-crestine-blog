# Testing

How to test, the fast check, and the known-broken tests. Read before claiming anything works:
"done" means the checks ran and their output was read, not that the code looks right.

| Level | Command | When |
|---|---|---|
| Fast check | `bin/check`; includes the article-text rule: every published post has its `source.txt`, and a committed one changes only after `verify-text` matched it to its origin | before every commit |
| Fetch script | `bin/fetch-doc` with no arguments, a non-Google link, a bad slug, an unshared doc: each exits 1 with a clear message, writes nothing; then a real shared doc into a test slug (byte-exact `source.txt`, identical on a second run), deleted afterwards; with a third argument it writes there instead | after changing it |
| Contact form | locally, nothing sent (`dev-environment.md`): GET 405; empty, bad email, 5,001 characters 400; honeypot 200 with no mail; Turnstile fail secret 403; no config 500 with the generic message; valid 200 and one mail with UTF-8 name and subject, Reply-To the reader; a line break in the name adds no header; in the browser, Turnstile loads only on focus and the button reads Mulțumim! | after changing `contact.php` or `ContactForm.astro` |
| Preview deploy | `npm run deploy -- preview` (plan only), a wrong `--yes` ID (refused, exit 1), then the approved ID; afterwards every preview URL answers 401 | after changing `bin/deploy.ts` |
| Article text against its origin | `npm run verify-text` (all posts) or `npm run verify-text -- <slug>`: each `source.txt` against its Google Doc (byte for byte) or, until cut-over, its live WordPress page (word for word); `0 differ, 0 could not be checked` | before every deploy; after an import or a post update from its doc |
| Types | `npm run check` | before every commit touching `src/` or `bin/*.ts` |
| Build and text integrity | `npm run build`: fails when a post's rendered text differs from its `source.txt` (`content-model.md`, the check) | before every commit and deploy |
| Redirects | `npm run check-redirects` after a build: every old URL is one 301 to a 200, a 200, or a deliberate 410 | after touching redirects, slugs or the import; before cut-over |
| Importer | `npm run import` twice, hashing `content/` and `import/` after each run: identical; the report says `problems 0, text differences 0` (each citation word for word against its elements, and in one piece in the page's text) | after changing `bin/import-wp.ts` or `bin/lib/` |

The article-text checks were tested 2026-10-23 on `acum-alege-deuteronom-3019`: one word
changed identically in `index.md` and `source.txt` passed the build but failed `bin/check`
and `verify-text` (naming the word); a line-break-only change failed `bin/check` until
`verify-text` matched it to the live page; a deleted `source.txt` failed `bin/check` and the
build. `verify-text` on all 73 imported posts: 73 ok, 13 s. Not yet run against a real Google
Doc (none in the repo); its error path was (unreachable doc: reported, exit 1).

A check must not share its input with the code it checks (2026-10-23): the citation import
passed "word for word against the page" with six citations repeated up to five times
(`consistenta`), because the check read the same nested elements the importer had picked.
The second, independent check (the citation in one piece in the page's text) failed on the
repeated text and passes on all 61 after the fix.

The text check was tested by changing one diacritic in a `source.txt`: the build failed,
naming the post and the word (2026-10-22). Rows for a link check and an SEO lint of the built
HTML (one title, description, canonical, `<h1>` and valid JSON-LD per page, `seo.md`) are
added as each one lands.

Known failing: `check-redirects` exits 1 until the open questions of
`specs/wordpress-import.md` are settled (`/despre-noi/`, `/contact/`, `quote`, `dailyverse`
and `/wp-content/uploads/` URLs).

Slow: the first build (about 4 minutes, AVIF encoding).
