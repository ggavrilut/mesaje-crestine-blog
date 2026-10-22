# WordPress import

Status: building · Owner: Gabriel Gavrilut · Last updated: 2026-10-22

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

- [x] Given the live site, when the importer runs, then all 73 published posts exist as
  `content/posts/<slug>/index.md` with `title`, `date`, `updated`, `author`, `cover`,
  `legacyUrl`, and a `source.txt` holding the extracted text. `updated` only when WordPress's
  `modified` is more than a day after `date`; `cover` only when the post has one (below).
- [x] The author of each post comes from `author_taxonomy` (32 terms on 2026-10-22), not the
  WordPress user; each author with at least one post gets `content/authors/<slug>.md`.
  `author` is a list (one post has two authors); a post with none is imported as a draft and
  listed in the report (owner, 2026-10-22).
- [x] A post whose page has no `post-content` element is read from its rendered HTML (the
  Bricks text and video elements): the eight with empty REST `content`, plus `rugaciune`,
  whose REST content holds only the first 69 of the page's 385 words, and
  `focalizat-o-poveste-si-o-cantare`. The template label "Publicat de" is dropped; the
  credit "Editat de Dorina Cheloiu" is kept as text. No imported text is empty.
- [x] Every image used by a post is downloaded next to the post as its cover (no post has
  inline images); no `wp-content/uploads` URL remains in `content/`. A post without a
  featured image (11) has no cover; covers under 1200 px (5) are kept; both are listed in
  the report (owner, 2026-10-22: `cover` is optional for imported posts).
- [x] The text of each imported post, compared word for word with the text on the live page,
  is identical (a report lists every difference; zero expected). Zero on 2026-10-22.
- [ ] Each post's `description` is empty after import and filled by the post writer in a
  separate, reviewed pass (`seo.md`: the WordPress descriptions are truncated paragraphs).
  Also `coverAlt` and `related`. Run it after the last import: the importer overwrites
  `index.md`.
- [ ] The redirect map covers every URL in the old sitemap plus the patterns in `seo.md`,
  "The move"; `bin/check-redirects.ts` checks each old URL against the built site and expects
  one 301 to a 200 (or a deliberate 410). 2026-10-22: all 73 posts and every archive, feed
  and author URL pass; failing are `/despre-noi/`, `/contact/`, 10 `quote`/`dailyverse` URLs
  and 41 image URLs (open questions).
- [x] Running the importer twice gives the same files (repeatable until cut-over): 237 files
  identical by hash, 2026-10-22.
- [ ] Pages: `sample-page` and the four Bricks `/template/…` pages get a 410; `blog` becomes
  the archive; every `/category/…`, `/tag/…`, `/author/…` and date archive URL 301s to
  `/blog/` (done). `despre-noi` and `contact` are not imported: on the live site the first is
  a Bricks demo placeholder ("Trusted Real Estate Agents", lorem ipsum) and the second is only
  the form. Both are built as pages at the same URLs (owner, 2026-10-22): the about text from the owner, the form
  from the contact-form spec.
- [x] Videos inside a post's text (two posts, three videos) stay at their place as a line
  holding only the YouTube URL, rendered as the click-to-load facade (owner, 2026-10-22).

## Data and interfaces

Source: `https://mesaje-crestine.ro/wp-json/wp/v2/` (`posts`, `pages`, `media`,
`author_taxonomy`), the sitemap at `/sitemap.xml`, and each post's HTML. 71 media items,
about 40 MB. No credentials needed. Run: `npm run import` (`bin/import-wp.ts`).

Output: `content/`; `import/report.md` (every finding above, sorted); `import/legacy-urls.txt`
(the 165 old sitemap URLs, images included); `import/redirects.tsv` (non-post redirects:
author terms without posts). Post redirects come from each post's `legacyUrl` at build, into
`dist/.htaccess` (`src/pages/htaccess.txt.ts`, with `src/redirects/static.htaccess`).

## Open questions

- The zip `fragmente-lda.zip` is attached to `cum-sa-traiesti-in-cristos`, but no imported
  text links it; the PDF `O-mantuire-asa-de-mare-Paris-Reidhead.pdf` is attached to nothing.
  Keep, link or drop? Owner.
- The `quote` (3) and `dailyverse` (5) posts and their archives are in the old sitemap but
  not in the REST API. A page, a 301 to a related post, or a 410? `seo` agent, then owner.
- The 41 image URLs under `/wp-content/uploads/` in the old sitemap: 301 to the post that
  uses the image, or let them 404? `seo` agent.
- Author bios: the owner writes them (`paris-reidhead`'s "Un scurt bio" is a placeholder,
  not imported).
- The author term `necunoscut` ("unknown") gets an author page. Keep it? Owner.

## Done when

- [ ] every Behaviour line passes and the test that proves it exists
- [ ] `docs/` updated wherever the feature changed a rule, a flow or a command
- [ ] Status set to built; `docs/state.md` cleared of this feature
