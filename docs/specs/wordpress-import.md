# WordPress import

Status: draft · Owner: Gabriel Gavrilut · Last updated: 2026-10-22

## Goal

Every article, author, page and image of the live WordPress site exists in `content/` with
its original text, date and author, and every old URL has its 301. After this, the new site
can replace WordPress without a reader or a search engine losing a page.

## Non-goals

- Changing any article's text, including obvious typos (`hard-rules.md`).
- Writing anything to WordPress: the import reads public endpoints only.
- Comments (there are none), categories and tags (dropped), the Mailjet newsletter, the PWA
  plugin.

## Behaviour

- [ ] Given the live site, when the importer runs, then all 73 published posts exist as
  `content/posts/<slug>/index.md` with `title`, `date`, `updated`, `author`, `cover`,
  `legacyUrl`, and a `source.txt` holding the extracted text.
- [ ] The author of each post comes from `author_taxonomy` (29 terms), not the WordPress
  user; each author with at least one post gets `content/authors/<slug>.md`.
- [ ] The eight posts whose REST `content` is empty are read from their rendered HTML; their
  text is not empty after import.
- [ ] Every image used by a post (cover and inline) is downloaded next to the post; no
  `wp-content/uploads` URL remains in `content/`.
- [ ] The text of each imported post, compared word for word with the text on the live page,
  is identical (a report lists every difference; zero expected).
- [ ] Each post's `description` is empty after import and filled by the post writer in a
  separate, reviewed pass (`seo.md`: the WordPress descriptions are truncated paragraphs).
- [ ] The redirect map covers every URL in the old sitemap plus the patterns in `seo.md`,
  "The move"; a check fetches each old URL against the built site and expects one 301 to a
  200.
- [ ] Running the importer twice gives the same files (repeatable until cut-over).
- [ ] Pages: `despre-noi` and `contact` imported as pages; `sample-page` gets a 410; `blog`
  becomes the archive; every `/category/…` and `/tag/…` URL 301s to `/blog/`.

## Data and interfaces

Source: `https://mesaje-crestine.ro/wp-json/wp/v2/` (`posts`, `pages`, `media`,
`author_taxonomy`), plus each post's HTML for the eight empty ones. 71 media
items, about 40 MB. Output: `content/`, a redirect list for `.htaccess`, an import report.
No credentials needed.

## Open questions

- The PDF and the zip in the media library: which post or page uses them? The importer
  reports it.

## Done when

- [ ] every Behaviour line passes and the test that proves it exists
- [ ] `docs/` updated wherever the feature changed a rule, a flow or a command
- [ ] Status set to built; `docs/state.md` cleared of this feature
