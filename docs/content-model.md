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

The owner may give a Google Doc link instead; the doc holds the same text and metadata
block. The doc must be shared as "Anyone with the link: Viewer".

1. Take the document ID from the link (`/document/d/<ID>/`).
2. Download with `curl -sSL`, **never with WebFetch**: WebFetch passes the page through a
   model that summarises and rewrites, which breaks the text rule. The post writer does not
   have WebFetch for this reason.
   - Text for `source.txt`: `https://docs.google.com/document/d/<ID>/export?format=txt`.
     Strip only a leading byte-order mark (U+FEFF); nothing else is touched.
   - Formatting for the body (italic, bold, quotes): the same URL with `format=md`.
   - Images embedded in the doc: `format=zip` (HTML plus an `images/` folder).
3. If the response is HTML or lands on `accounts.google.com`, the doc is not shared: stop and
   ask the owner to share it. Never guess the text from anything else.
4. Record the link as `sourceDoc` in the front matter, so a later update reads the same doc.

The `format=md` export and how images come out are confirmed on the first real doc
(`state.md`).

## Layout on disk

```
content/
  posts/<slug>/index.md     front matter + body
  posts/<slug>/source.txt   the input text, verbatim, metadata block removed
  posts/<slug>/cover.jpg    the cover image (any web format)
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
| `author` | yes | input | slug of a file in `content/authors/`; a new author gets a file |
| `cover` | yes | input | `./cover.jpg` |
| `coverAlt` | yes | post writer | describes the image, in Romanian |
| `video` | no | input | YouTube URL |
| `source` | no | input | citation shown under the article |
| `sourceDoc` | no | post writer | the Google Doc link, when the input came from one |
| `related` | yes | post writer | 2–4 slugs: same author first, then same topic (no categories, `decisions.md`) |
| `legacyUrl` | imported posts | importer | the WordPress URL; generates its 301 |
| `draft` | no | post writer | `true` keeps it out of the build |

## Author front matter

`name` (as written in the input), `slug`, optional `bio` (owner-supplied, never written by an
agent) and optional `image` with `imageAlt`.

## What formatting may do to the body

| Allowed | Not allowed |
|---|---|
| Split or join paragraphs at the line breaks of the input | Add, delete, reorder or replace any word |
| Mark a Bible quotation or a quoted passage as a `>` blockquote | Correct spelling, punctuation, diacritics, typography (`"` to `„”`) |
| Turn lines that already read as a list into a Markdown list | Add headings, a summary, an introduction or a conclusion |
| Italic or bold where the input already has it | Add links inside the text (links go through `related` and `author`) |

**Check:** the words of `index.md`'s body, stripped of Markdown syntax, must equal the words of
`source.txt`, character for character. This becomes a script in `bin/` once the site is
scaffolded (`state.md`); until then the post writer runs the comparison and shows its output.
