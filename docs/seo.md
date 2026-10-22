# SEO rules

What every page, URL and post must satisfy so search engines find, understand and rank the
site, and so the move from WordPress loses nothing. Owned by the `seo` subagent; the developer
agent reads it before touching URLs, `<head>`, layouts or redirects, the post writer before
every post. **The current WordPress SEO is not a reference** (owner, 2026-10-22): its problems
are listed in the baseline below so they are not carried over.

A rule enters here with its source. Advice without one is a candidate in `state.md`.

## Sources

| Key | Source |
|---|---|
| G-move | Google Search Central, "Site moves with URL changes": developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes |
| G-title | "Influencing your title links": developers.google.com/search/docs/appearance/title-link |
| G-snippet | "Control your snippets": developers.google.com/search/docs/appearance/snippet |
| G-article | "Article structured data": developers.google.com/search/docs/appearance/structured-data/article |
| G-video | "Video SEO best practices" and VideoObject: developers.google.com/search/docs/appearance/video |
| G-image | "Image SEO best practices": developers.google.com/search/docs/appearance/google-images |
| G-discover | "Get on Discover": developers.google.com/search/docs/appearance/google-discover |
| G-links | "Link best practices": developers.google.com/search/docs/crawling-indexing/links-crawlable |
| G-canon | "Consolidate duplicate URLs": developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls |
| G-sitemap | "Sitemaps overview": developers.google.com/search/docs/crawling-indexing/sitemaps/overview |
| G-helpful | "Creating helpful, reliable, people-first content": developers.google.com/search/docs/fundamentals/creating-helpful-content |
| G-bread | "Breadcrumb structured data": developers.google.com/search/docs/appearance/structured-data/breadcrumb |
| G-profile | "ProfilePage structured data": developers.google.com/search/docs/appearance/structured-data/profile-page |
| G-hreflang | "Tell Google about localized versions of your page": developers.google.com/search/docs/specialty/international/localized-versions |
| CWV | web.dev, "Web Vitals": web.dev/articles/vitals |
| OGP | The Open Graph protocol: ogp.me |
| IndexNow | indexnow.org, supported by Bing and Yandex |
| Bing | Bing Webmaster Guidelines: bing.com/webmasters/help/webmaster-guidelines-30fba23a |

## Rules

### Language and locale
- `<html lang="ro">` on every page; `og:locale` `ro_RO`; JSON-LD `inLanguage` `ro-RO`. (OGP,
  G-article)
- All content is Romanian for now, served at the root with no `/ro/` prefix. A second
  language, if it comes, gets its own prefix (`/en/…`) and `hreflang` links between
  translations; Romanian URLs stay unchanged. (G-hreflang)
- Dates shown in Romanian ("22 octombrie 2026") inside `<time datetime="2026-10-22T…+03:00">`
  with the Europe/Bucharest offset. (G-article: dates need a timezone)
- Metadata the agents write (descriptions, alt text) uses correct Romanian diacritics,
  comma-below `ș ț`. Article text is never touched (`hard-rules.md`).

### URLs
- Articles: `https://mesaje-crestine.ro/<slug>/`. Lowercase ASCII, words joined by hyphens,
  diacritics transliterated (`ă â → a`, `î → i`, `ș → s`, `ț → t`), trailing slash, no dates,
  no stop-word stripping that changes meaning. (G-links, decisions 2026-10-22)
- Authors: `/authors/<slug>/`, the path WordPress already uses, so these need no redirect.
- One URL per page: `https`, no `www` (the host already 301s both), trailing slash. Every
  other variant 301s to it. (G-canon)
- A published slug never changes. If it must, the old one gets a 301 in the same commit.
  (`hard-rules.md`, G-move)

### Titles (`<title>`)
- Unique per page. Post: `<title>{post title} | Mesaje Creștine</title>`. When that exceeds
  about 60 characters, drop the brand suffix or use the post's `seoTitle`; Google sets no hard
  limit but truncates display around there. (G-title)
- The visible `<h1>` is the post title exactly as given, one per page; body headings start at
  `<h2>`. (G-title: the `<h1>` is one of the title-link sources)

### Meta description
- Written per page as a summary of 120–155 characters, in Romanian, no quotes cut mid-word.
  Never the first paragraph truncated (the WordPress baseline). Unique across the site.
  (G-snippet)

### Canonical, robots, indexability
- Self-referencing absolute `<link rel="canonical">` on every indexable page. (G-canon)
- `robots.txt`: allow everything, `Sitemap: https://mesaje-crestine.ro/sitemap-index.xml`.
  Never disallow CSS, JS or images. (G-sitemap, Bing)
- `noindex` on the search results page and on any archive page with fewer than two posts. The
  404 page returns status 404, not 200. (G-helpful: no thin pages; G-canon)
- Pagination: plain `<a href>` links to `/page/2/` and so on, each page self-canonical. (G-links)

### Structured data (JSON-LD, one `@graph` per page)
- Post: `BlogPosting` with `headline`, `description`, `image` (at least 1200 px wide; 16:9,
  4:3 and 1:1 crops recommended), `datePublished`, `dateModified`, `inLanguage`, `author` as a
  `Person` with `name` and `url` = the author's page, `publisher` as the site `Organization`
  with `logo`, `mainEntityOfPage`. **The author is the article's author (Erich Sauer, Watchman
  Nee…), never the site owner.** (G-article)
- Every page below home: `BreadcrumbList` (Acasă › Autori › Watchman Nee › article). (G-bread)
- Home: `WebSite` and `Organization`. Author pages: `ProfilePage` with `mainEntity` the
  `Person`. (G-profile)
- Post with a video: `VideoObject` with `name`, `description`, `thumbnailUrl`, `uploadDate`,
  `embedUrl`. (G-video)
- Every template is validated with the Rich Results Test and the Schema.org validator before
  its first deploy. (G-article)

### Social cards
- `og:title`, `og:description`, `og:url` (= canonical), `og:image` 1200×630 with
  `og:image:alt`, `og:type` `article` with `article:published_time`, `article:modified_time`
  and `article:author`; `twitter:card` `summary_large_image`. One of each, never duplicated
  (the WordPress baseline has two `og:title`). (OGP)

### Images
- Every content image has Romanian `alt` text describing it, a descriptive file name, and
  explicit `width` and `height`. Served through `astro:assets` as AVIF/WebP with `srcset`. (G-image, CWV: CLS)
- Covers are at least 1200 px wide, and every page carries
  `<meta name="robots" content="max-image-preview:large">`, so Google may show the large
  preview in Discover and search. (G-discover)
- The cover image is the LCP element: `loading="eager"` and `fetchpriority="high"`; every
  other image `loading="lazy"`. (CWV)

### Video
- YouTube embeds use a click-to-load facade (thumbnail plus button, iframe on click), so no
  third-party JS loads with the page. (CWV; G-video for the thumbnail)

### Internal links
- Every post links its author's page and two to four related posts (same author first, then
  same topic), through the post template, never by editing the text. (G-links)
- Breadcrumbs, author index, chronological archive: no page is reachable only through search.
  Every page is reachable from home in at most three clicks. (G-links)
- Anchor text says where the link goes; no "click aici". (G-links)

### Sitemap and feeds
- `sitemap-index.xml` generated at build, listing only canonical, indexable, 200 URLs, with
  `lastmod` set only when the content really changed. Submitted in Google Search Console and
  Bing Webmaster Tools. (G-sitemap)
- RSS at `/rss.xml`; WordPress's `/feed/` 301s to it, so subscribers keep working.
- On each deploy, changed URLs are announced through IndexNow (Bing, Yandex). (IndexNow)

### Performance (Core Web Vitals, at the 75th percentile, mobile)
- Targets: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1. (CWV)
- The consent banner overlays the page bottom without moving content (no CLS) and is never
  the largest element in the first viewport. (CWV)
- No client JS by default; each island is justified in its spec. Analytics loads `async` and
  never blocks rendering.
- Fonts self-hosted, subset including `ă â î ș ț Ă Â Î Ș Ț`, `font-display: swap`, at most two
  files preloaded.
- `.htaccess`: long `Cache-Control` (1 year, `immutable`) for hashed assets, short for HTML;
  compression on if the host allows it.

### Content quality signals
- Each author page carries the author's name, a short bio and the list of their articles;
  each post shows author and date visibly. (G-helpful: "who created the content")
- No empty or placeholder pages are published (`/sample-page/` gets a 410). (G-helpful)

## The move from WordPress

Same domain, new URLs, so this is a site move with URL changes; Search Console's Change of
Address tool does not apply, since it is only for a domain change. (G-move)

1. Inventory every old URL: posts, pages, `/authors/…`, `/category/…`, `/author/<wp-user>/`,
   date archives `/YYYY/MM/`, `/page/N/`, `/blog/page/N/`, `/feed/`, `/sitemap.xml`,
   `/sitemap.rss`, image URLs under `/wp-content/uploads/` that external sites may link to.
2. Map each one 1:1 to its new URL with a 301 (`.htaccess`, generated at build from each
   post's `legacyUrl`). A page with no equivalent maps to the closest relevant page, or 410 if
   none; never everything to the home page. No redirect chains.
3. Internal links, canonicals, sitemap and structured data use only new URLs.
4. After cut-over: submit the new sitemap, inspect a sample of old URLs in Search Console,
   watch "Pages" and 404 reports weekly for a month.
5. Keep the redirects for at least one year; in practice, forever. (G-move)
6. Search Console is verified by a DNS TXT record (checked 2026-10-22), so removing WordPress
   does not break the verification. Never delete that record.

## Baseline: the live WordPress site, 2026-10-22

Measured by curl on the public site. None of this carries over.

| Found | Why it hurts | Rule above |
|---|---|---|
| `inLanguage: en-US`, `og:locale: en_US` on Romanian content | Wrong language signal | Language and locale |
| JSON-LD `author` is the WP user "Gabriel Gavrilut" on every post; the real author (e.g. Erich Sauer) lives in a custom taxonomy | Misattributes every article to the site owner | Structured data |
| Meta description is the first paragraph cut at about 300 characters | Truncated, not a summary | Meta description |
| Two `og:title` tags per post | Ambiguous card title | Social cards |
| 69 of 73 posts in "Uncategorized"; `articleSection: "Uncategorized"` | No topical structure, thin archive | Categories dropped (`decisions.md`); internal links |
| `/sample-page/` returns 200 | Indexable placeholder | Content quality |
| Dates shown in English ("October 9, 2026") | Inconsistent with the language | Language and locale |
| Five tags, all empty | Empty archive pages | Canonical, robots, indexability |
