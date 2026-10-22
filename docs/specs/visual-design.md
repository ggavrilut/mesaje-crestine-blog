# Visual design

Status: building · Owner: Gabriel Gavrilut · Last updated: 2026-10-22

## Goal

The home and article pages look as the owner's design handoff specifies:
`design/design_handoff_mesaje_crestine/README.md` (tokens, sizes, layout, interactions), with
its two `.dc.html` files as the visual reference. That README is the source of every value;
this spec records only how it was built and where the build departs from it. The pages the
handoff does not cover (archive, authors, 404) reuse its parts.

## Non-goals

- The contact form in the footer: built from the contact-form spec (`architecture.md`,
  contact form: PHP handler, Turnstile). Until then the footer has only its first column.
- A client-side author filter: the chips are links to the author pages.
- A reader-facing text-size control: the handoff's 17/19/21 px is a prototyping option; the
  body is 19 px.
- New front matter fields (`authorSlug`, `image`, `excerpt`, `pubDate`): the handoff's names
  map onto `content-model.md` (`author`, `cover`, the excerpt helper, `date`).

## Behaviour

- [x] Header sticky on every page; the 2 px progress bar on articles, CSS scroll-driven, no JS
  (hidden where the browser lacks scroll timelines).
- [x] Home: verse band, the newest post featured (4:3 image, label with the full date,
  `<h1>`, author, 40-word excerpt), the next nine in two columns (author · "Oct 2026",
  title, 24-word excerpt), pager `1 2 3 … 8 →` into `/blog/page/N/`.
- [x] Chips: "Toți" (current) and the five authors with the most posts, linking to their pages.
- [x] Article: author, date ("30 iunie 2023"), `<h1>`, share links; full-bleed 21:8 cover when
  the post has one; the body in the 1040 px column; the source note when `source` is set; the
  author box; "Citește și" with the related posts and the previous (older) post.
- [x] Every grid collapses to one column; no horizontal scroll at 390 px.
- [x] Fonts self-hosted (Roboto, Source Serif 4 with its `opsz` axis); two files preloaded.
- [x] The build's text check passes: the body markup only gets CSS.

## Data and interfaces

`src/styles/global.css` (tokens on `:root`), `src/layouts/Base.astro` (header, footer),
`src/components/` (`PostList`, `PostCard`, `Pager`), `src/pages/index.astro` and
`src/pages/[slug].astro`. The verses are in `src/lib/site.ts` (`HERO_VERSE`, `FOOTER_VERSE`);
excerpts come from `excerpt()` there, dates from `src/lib/dates.ts`.

Client JS: one module on article pages, for the video facade and "Copiază link". The copy
button stays hidden without the Clipboard API, so nothing on the page is dead (`seo.md`,
performance: each island justified here).

## Deliberate differences from the handoff

- Header "Autori" links to `/authors/`, not `/#autori`, so the author index stays one click
  from every page (`seo.md`, internal links).
- Pagination stays at `/blog/page/N/`, not `/page/N/`: `/page/N/` already 301s to `/blog/`
  (`src/redirects/static.htaccess`), and no URL changes without a redirect (`hard-rules.md`).
- No visible breadcrumbs on home and article pages, as designed; the `BreadcrumbList`
  JSON-LD stays (`seo.md`). Archive and author pages keep visible breadcrumbs.
- The list is capped at two columns: the handoff's `auto-fit` CSS fits three at 1440 px,
  against its own "two columns".
- Excerpts are the article's first words; the handoff shows hand-picked passages
  (`state.md`, open questions).
- Posts without a cover show the striped placeholder on cards and no hero on the article.
- Author portraits (`AuthorPortrait.astro`): 56 px in the author box as designed, and 96 px
  above the name on author pages, which the handoff does not cover; the striped circle where
  an author has none (`decisions.md`).

## Open questions

- Hand-picked excerpts and the citation lines under the text: see `state.md`. Owner.

## Done when

- [x] every Behaviour line passes, checked by screenshots at 1440 and 390 px against the
  handoff files
- [ ] the contact form fills the footer's second column (its own spec)
- [ ] Status set to built; `docs/state.md` cleared of this feature
