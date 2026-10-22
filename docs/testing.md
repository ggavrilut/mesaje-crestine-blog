# Testing

How to test, the fast check, and the known-broken tests. Read before claiming anything works:
"done" means the checks ran and their output was read, not that the code looks right.

| Level | Command | When |
|---|---|---|
| Fast check | `bin/check` | before every commit |
| Fetch script | `bin/fetch-doc` with no arguments, a non-Google link, a bad slug, an unshared doc: each exits 1 with a clear message, writes nothing; then a real shared doc into a test slug (byte-exact `source.txt`, identical on a second run), deleted afterwards | after changing it |
| Types | `npm run check` | before every commit touching `src/` or `bin/*.ts` |
| Build and text integrity | `npm run build`: fails when a post's rendered text differs from its `source.txt` (`content-model.md`, the check) | before every commit and deploy |
| Redirects | `npm run check-redirects` after a build: every old URL is one 301 to a 200, a 200, or a deliberate 410 | after touching redirects, slugs or the import; before cut-over |
| Importer | `npm run import` twice, hashing `content/` and `import/` after each run: identical; the report says `problems 0, text differences 0` | after changing `bin/import-wp.ts` or `bin/lib/wp-markdown.ts` |

The text check was tested by changing one diacritic in a `source.txt`: the build failed,
naming the post and the word (2026-10-22). Rows for a link check and an SEO lint of the built
HTML (one title, description, canonical, `<h1>` and valid JSON-LD per page, `seo.md`) are
added as each one lands.

Known failing: `check-redirects` exits 1 until the open questions of
`specs/wordpress-import.md` are settled (`/despre-noi/`, `/contact/`, `quote`, `dailyverse`
and `/wp-content/uploads/` URLs).

Slow: the first build (about 4 minutes, AVIF encoding).
