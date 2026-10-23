# Content model

How posts and authors are stored, what the owner hands the post writer, and what formatting
may and may not do to an article. Read before touching a post, an author or their schema. The
SEO side of each field is in `seo.md`.

**The text is never changed** (`hard-rules.md`): no word, punctuation mark or diacritic is
added, removed, reordered or corrected, including cedilla `ş ţ` against comma-below `ș ț`.
A suspected typo is reported to the owner, who decides.

## The input the owner gives

A message or a `.txt`/`.md` file: the finished Romanian text first, then a metadata block at
the bottom after a line of three dashes. Labels may be Romanian or English, in any order.

```
<the article text, exactly as it will be published>

---
Titlu: Ceasul hotărârii
Autor: Erich Sauer
Imagine: ./ceasul.jpg          (a path or a URL)
Video: https://youtu.be/…      (optional; YouTube only)
Data: 2026-10-22               (optional; default: today)
Sursa: Erich Sauer, „…”, p. 12 (optional; shown under the article)
```

Missing title or author: the post writer asks. A video that is not a YouTube link: it asks.

### From a Google Doc link

The owner may give a Google Doc link instead. The doc must be shared as "Anyone with the
link: Viewer". The metadata block at its end is optional: when it is missing, title, author
and the rest come from the owner's `/publish` message, or the post writer asks. The doc's
name is not a title: Google returns it without diacritics.

1. Take the document ID from the link (`/document/d/<ID>/`).
2. Download with `bin/fetch-doc <link> <slug>`, **never with WebFetch**: WebFetch passes the page through a model that summarises and
   rewrites, which breaks the text rule. No agent here has WebFetch except `seo`.
   - Text for `source.txt`: `https://docs.google.com/document/d/<ID>/export?format=txt`.
     Strip only a leading byte-order mark (U+FEFF); nothing else is touched.
   - Formatting for the body (italic, bold, quotes): the same URL with `format=md`.
   - Images embedded in the doc: `format=zip` (HTML plus an `images/` folder).
3. If the response is HTML or lands on `accounts.google.com`, the doc is not shared: stop and
   ask the owner to share it. Never guess the text from anything else.
4. Record the link as `sourceDoc` in the front matter, so a later update reads the same doc.

Measured on the first real doc (2026-10-22): the `txt` export starts with a BOM and uses
CRLF line endings; the `md` export has the same 809 words once its escapes (`\!`, `\[`,
`\]`, `\-`) are read as the characters they stand for, so it is safe as the formatting
reference. A `--------------` line inside the text is part of the article, not metadata.

## Layout on disk

```
content/
  posts/<slug>/index.md     front matter + body
  posts/<slug>/source.txt   the input text, verbatim, metadata block removed
  posts/<slug>/meta.txt     the metadata block (from a Google Doc)
  posts/<slug>/source.md    the doc's Markdown export: formatting reference only
  posts/<slug>/cover.jpg    the cover image (any web format)
  posts/<slug>/<name>.pdf   optional: the article as a PDF (`pdf`)
  authors/<slug>.md         one per author: front matter + optional bio
```

## Post front matter

| Field | Required | Filled by | Rule |
|---|---|---|---|
| `title` | yes | input, verbatim | becomes the `<h1>` |
| `slug` | yes | post writer | from the title, `seo.md` URLs; never changed once published |
| `seoTitle` | no | post writer | only when `title` + brand exceeds about 60 characters |
| `description` | yes | post writer | 120–155 characters, a summary in Romanian, `seo.md` |
| `date` | yes | input or today | ISO 8601 with offset, Europe/Bucharest |
| `updated` | no | post writer | set only when the content changes |
| `author` | yes | input | slug of a file in `content/authors/`, or a list of slugs for several authors; a new author gets a file |
| `cover` | yes | input | `./cover.jpg`, at least 1200 px wide (`seo.md`); narrower → the post writer asks for a larger one. Optimised at build, never by hand. Optional for imported posts (with `legacyUrl`), as are `coverAlt`, `description` and `related` until the post writer's pass |
| `coverAlt` | yes | post writer | describes the image, in Romanian |
| `video` | no | input | YouTube URL, shown after the text. A video placed inside the text is a line holding only `https://www.youtube.com/watch?v=<id>`: it renders as the video, and the text check skips it |
| `source` | no | input | citation shown under the article, the author's or translator's words, never edited: plain text, Markdown links (link text in square brackets, then the address in parentheses), line breaks, a blank line between paragraphs (`src/lib/citation.ts`). Imported from the page for imported posts |
| `pdf` | no | input | `./<name>.pdf`, lowercase ASCII with hyphens, in the post folder: the article as a PDF, linked under the title ("Descarcă articolul în format PDF") and served at `/<slug>/<name>.pdf` (`src/pages/[slug]/[pdf].ts`). Imported from the link above the article; its old URL gets a 301 in `import/redirects.tsv` |
| `sourceDoc` | no | post writer | the Google Doc link, when the input came from one |
| `related` | yes | post writer | 2–4 slugs: same author first, then same topic (no categories, `decisions.md`) |
| `legacyUrl` | imported posts | importer | the WordPress URL; generates its 301 |
| `draft` | no | post writer | `true` keeps it out of the build |

## Author front matter

`name` (as written in the input), `slug`, optional `bio` (owner-supplied, never written by an
agent) and optional `image` (`./<slug>.jpg` next to the file) with `imageAlt`, and
`imagePosition`, the crop of the round portrait: sharp's gravity (`top`, `left top`) or
`attention` (the default). A new portrait for an imported author goes in the importer's
`PORTRAITS`, or a re-import drops it.

## What formatting may do to the body

| Allowed | Not allowed |
|---|---|
| Split or join paragraphs at the line breaks of the input | Add, delete, reorder or replace any word |
| Mark a Bible quotation or a quoted passage as a `>` blockquote | Correct spelling, punctuation, diacritics, typography (`"` to `„”`) |
| Turn lines that already read as a list into a Markdown list | Add headings, a summary, an introduction or a conclusion |
| Italic or bold where the input already has it | Add links inside the text (links go through `related` and `author`) |

**Check:** every build compares each post's rendered text with its `source.txt`, word for
word and character for character (line and paragraph breaks may differ), and fails on the
first difference, naming the post and the word (`src/integrations/build-checks.ts`). It reads
the built page, so it also catches the Markdown renderer changing text: Astro's renderer
turns on smart punctuation (`"` to `“”`, `--` to `–`) and bare-URL links by default, and
both are off in `astro.config.ts`. Known conflict: a Markdown list drops the `-` or `1.` the
input had, so the check fails on a list the table above allows (`state.md`).

The build trusts `source.txt`, so two more checks guard `source.txt` itself: an edit to both
files would pass the build. `bin/check` fails when a published post has no `source.txt`, or
when a committed one changed, until `npm run verify-text` has matched the new file to the
post's origin: its `sourceDoc` (byte for byte, through `bin/fetch-doc`) or, until cut-over,
its `legacyUrl` on WordPress (word for word). `verify-text` with no slug audits every post.
After cut-over, an imported post's record is the git history of its `source.txt`.
