# Testing

How to test, the fast check, and the known-broken tests. Read before claiming anything works:
"done" means the checks ran and their output was read, not that the code looks right.

| Level | Command | When |
|---|---|---|
| Fast check | `bin/check` | before every commit |
| Fetch script | `bin/fetch-doc` with no arguments, a non-Google link, a bad slug, an unshared doc: each exits 1 with a clear message, writes nothing | after changing it |
| Text integrity | the body-against-`source.txt` comparison, `content-model.md` | after every post change; becomes a script with the scaffold |

Rows for `astro check`, the build, a link check and an SEO lint of the built HTML (one title,
description, canonical, `<h1>` and valid JSON-LD per page, `seo.md`) are added as each one
lands.

Known broken or slow: none yet.
