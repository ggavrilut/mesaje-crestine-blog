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
- [x] The redirect map covers every URL in the old sitemap plus the patterns in `seo.md`,
  "The move"; `bin/check-redirects.ts` checks each old URL against the built site and expects
  one 301 to a 200 (or a deliberate 410). 2026-10-23, after the proposal below was accepted:
  225 old URLs, 216 ok, 9 gone (410), 0 failing. Cover and portrait rules are written by the
  importer (`import/redirects.tsv`, each also matching WordPress's `-scaled` and `-WxH`
  copies); the editorial ones and the closing `^/wp-content/` 410 are in
  `src/redirects/static.htaccess`.
- [x] Running the importer twice gives the same files (repeatable until cut-over): 237 files
  identical by hash, 2026-10-22.
- [ ] Pages: `sample-page` and the four Bricks `/template/…` pages get a 410; `blog` becomes
  the archive; every `/category/…`, `/tag/…`, `/author/…` and date archive URL 301s to
  `/blog/` (done). `despre-noi` and `contact` are not imported: on the live site the first is
  a Bricks demo placeholder ("Trusted Real Estate Agents", lorem ipsum) and the second is only
  the form. `/contact/` is the contact-form page; `/despre-noi/` answers 410, since there is no
  About page and it was never linked (owner, 2026-10-23, superseding 2026-10-22).
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
  text links it. Keep, link or drop? Owner. (The PDF of `o-mantuire-asa-de-mare` is kept as
  its `pdf`, `decisions.md` 2026-10-23.)
- The `quote` (3) and `dailyverse` (5) posts and their archives are in the old sitemap but
  not in the REST API. A page, a 301 to a related post, or a 410? `seo` agent, then owner.
- The 41 image URLs under `/wp-content/uploads/` in the old sitemap: 301 to the post that
  uses the image, or let them 404? `seo` agent.
- Author bios: the owner writes them (`paris-reidhead`'s "Un scurt bio" is a placeholder,
  not imported).
- The author term `necunoscut` ("unknown") gets an author page. Keep it? Owner.

## Proposal for the remaining old URLs (seo agent, 2026-10-23)

Accepted as proposed by the owner, 2026-10-23, and built. The sitemap's
`2024/01/2-widows-mite-video-still-dsc6405-1.webp` already answers 404 on WordPress; the file
WordPress serves, `…-dsc6405-2400x1600-1.webp`, is the one redirected to its post. `npm run check-redirects` after `npm run build`, 2026-10-23: 184 old
URLs, 52 failing. This proposal: **49 × 301, 3 × 410**. Evidence: read-only GETs of each
live page, the live sub-sitemaps, `wp-json/wp/v2/media` and `posts`. Rule used: 301 only to a
page whose main subject is the old page's; otherwise 410. Google: "Don't redirect many old
URLs to one irrelevant single URL destination, such as the home page … might be treated as a
soft 404"; old content not moved should "return an HTTP 404 or 410" (G-move).

Inbound value: every URL below is in the old sitemap. None is linked from the live home page,
`/blog/`, a live post page or any imported post (checked 2026-10-23). External links and
search traffic are unknown: Search Console (Performance by page, Links) would show them. That
check needs the owner's yes.

### 1. `/despre-noi/`

| Old path | Rule | Target | Reason |
|---|---|---|---|
| `/despre-noi/` | 410 | none | The live page is the Bricks demo (lorem ipsum, "Trusted Real Estate Agents", "Meet the team"). It is not linked anywhere and the new site has no About page. A 301 to `/` is the irrelevant redirect G-move warns against. Same treatment as `/sample-page/`. A future About page can take the URL back. |

This contradicts `decisions.md` (2026-10-22), the Behaviour line "Both are built as pages"
above and the `state.md` open question "About text". If the owner confirms, those three need
updating (developer).

### 2. `quote` and `dailyverse`

Each entry is one sentence (a quote or a verse) with no other text, last changed 2021–2022.
The two archives show the latest-posts list, the same as `/blog/`, with English titles
("Quotes", "Daily Verses").

| Old path | Rule | Target | Reason |
|---|---|---|---|
| `/quote/` | 301 | `/blog/` | The live page lists the latest posts, as `/blog/` does |
| `/quote/105/` | 301 | `/domn-peste-toate-sau-deloc/` | Müller, "Un slujitor al lui Dumnezeu are un singur Stăpân": the post's subject is one Lord over all. No Müller post exists. |
| `/quote/107/` | 301 | `/focalizat-o-poveste-si-o-cantare/` | Chapman: give up whatever dims the vision of Christ. The post covers lives focused on Christ alone, giving up what distracts. |
| `/quote/cristos-este-sau-domn-peste-toate-sau-nu-este-domn-deloc-hudson-taylor/` | 301 | `/domn-peste-toate-sau-deloc/` | The post contains the same sentence. It credits the sentence to F.B. Meyer; the quote page credited Hudson Taylor. |
| `/dailyverse/` | 301 | `/blog/` | The live page lists the latest posts, as `/blog/` does |
| `/dailyverse/2021-10-18-ioan-1415/` | 301 | `/ma-iubesti/` | "Dacă Mă iubiţi…": the post is about love for the Lord ("Mă iubești?") |
| `/dailyverse/2021-10-20-ioan-1623/` | 301 | `/eu-am-biruit-lumea-ioan-1633/` | The page's text is Ioan 16:33, not 16:23 as the slug says. The post is about that verse. |
| `/dailyverse/2021-11-03-evrei-1228/` | 410 | none | No post is about Evrei 12:28. The fallback, `/un-ajutor-sau-o-piedica/`, covers Evrei 12 but not this verse. |
| `/dailyverse/2021-11-09-psalmul-1492/` | 410 | none | No post quotes or treats Psalmul 149 |
| `/dailyverse/2022-03-09-luca-2136/` | 301 | `/rugaciunea-pentru-revenirea-domnului/` | "Vegheați… rugându-vă": the post is about prayer looking to the Lord's coming |

### 3. The 41 image URLs under `/wp-content/uploads/`

**Rule: 301 to the post whose cover the image is.** Two alternatives are rejected:

- A 301 to the image itself: the `/_astro/` name is a content hash. It was identical
  across two builds on 2026-10-23, but it changes whenever the image, the transform settings
  or Astro change. A redirect kept "forever" (G-move) cannot point at it.
- A 404 or 410: this throws away what G-move asks for ("URLs of embedded content … images …
  need to be moved in the same way as all other content").

The post is the stable page that carries the image. Google Images rediscovers the new image
from it, and a person holding the old link lands on the article. No Google document covers a
redirect from an image to an HTML page. If Search Console shows real image-search traffic on
a file, a stable image URL beats a post for that file. That URL would be a fixed-path copy
emitted by the build (G-image: "consistently reference the image with the same URL").

For the developer:

1. Each rule also matches WordPress's size variants. The live pages embed `…-scaled.jpg` and
   `…-1024x768.jpg`, not the sitemap's original. Pattern:
   `^/wp-content/uploads/<yyyy>/<mm>/<name>(?:-scaled|-[0-9]+x[0-9]+)?\.<ext>$`.
2. A file shared by several posts goes to the post WordPress attached it to (REST `post`),
   which is also the first post to use it. `aaron-burden` is attached to the old home page.
   The new home does not show it, so it goes to the first post that used it.
3. Then one catch-all `^/wp-content/` → 410, after the specific rules. It covers the theme
   decorations, the old logo, unused media (`quotes01.png`, `dailyVerse.jpeg`, …) and the
   uploads' other files. Before adding it: the existing PDF rule stays above it. The zip
   (open question) and the 10 imported author portraits need their own 301s above it if they
   are to be kept: portrait → `/authors/<slug>/`.

The 41 files and their posts, as approved, are generated by the importer from each post's
cover (rule 2 above) and listed with their targets in `import/report.md`, "Redirects written
to import/redirects.tsv"; they matched the agent's table on 40, and the 41st under the name WordPress serves (above)
(2026-10-23).

## Done when

- [ ] every Behaviour line passes and the test that proves it exists
- [ ] `docs/` updated wherever the feature changed a rule, a flow or a command
- [ ] Status set to built; `docs/state.md` cleared of this feature
