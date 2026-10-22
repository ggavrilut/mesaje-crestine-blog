# Handoff: Mesaje Creștine — Homepage & Article page

## Overview
Redesign of the homepage and single-article page for https://mesaje-crestine.ro/ (Romanian Christian literature blog). Target stack: **Astro**. Articles are expected to come from Markdown/MDX content collections.

## About the design files
`Homepage Redesign.dc.html` and `Article Page.dc.html` are **HTML design references**, not production code. Open them in a browser (keep `support.js` next to them) to see the intended look. Recreate them as Astro layouts/components using normal Astro patterns (scoped `<style>` or a global CSS file — the inline styles in the references exist only for the prototyping tool).

## Fidelity
**High-fidelity.** Colors, type, spacing and layout are final. Match them closely.

## Suggested Astro structure
- `src/layouts/BaseLayout.astro` — `<head>` (fonts), Header, `<slot/>`, Footer
- `src/components/Header.astro`, `Footer.astro`, `VerseBand.astro`, `PostCard.astro`, `FeaturedPost.astro`
- `src/pages/index.astro` — homepage, paginated (`src/pages/page/[page].astro` with `paginate()`)
- `src/layouts/ArticleLayout.astro` + `src/pages/[...slug].astro` — renders Markdown `<Content/>`
- Content collection `posts` frontmatter: `title`, `author`, `authorSlug`, `image`, `excerpt`, `pubDate` (displayed in Romanian, e.g. "22 octombrie 2026"; list cards use short form "Oct 2026"), `related?: string[]`

## Design tokens
Colors
- Page background `#fbfcfb`
- Header bar background `#f3f6f5`, bottom border `#e2e8e5`
- Ink / headings `#2f3532`
- Body text (article) `#3a423e`; secondary text `#4b5550`; muted `#6b7670`
- Slate-green band (verse hero, footer) `#56625c`; footer input bg `#4d5853`, input border `#7b8781`, footer divider `#6b7670`
- Text on slate: `#f4f7f5` (primary), `#dfe8e4`, `#c5d3cd` (muted), `#bcd9d4` (teal-tint labels)
- Teal link/title `#2c8c84`, hover `#1d6d66`
- Brand teal (button, progress bar, quote rule) `#1da69a`, button hover `#17897f`
- Dividers `#e2e8e5`, `#e8ede9`; chip border `#d3dcd7`
- Image placeholder stripes `#e6ece9` / `#eef2f0`

Typography (Google Fonts)
- **Roboto** 300/400/500 — UI, headings, titles (headings are weight **300**)
- **Source Serif 4** (opsz 8..60) 300/400, italic — scripture quotes, excerpts, article body
- Logo: Roboto 300, 17px, letter-spacing 0.14em, uppercase "MESAJE CREȘTINE"
- Small labels: 12–13px, 400, uppercase, letter-spacing 0.12–0.18em

Layout
- Content container: `max-width: 1440px; margin: 0 auto; padding-inline: 32px`
- Article reading column: `max-width: 1040px`
- Radii: 2px (images, buttons, inputs), 999px (author chips)
- No shadows. Use `text-wrap: balance` on headings, `pretty` on paragraphs.

## Shared: Header
- Sticky on article page (top: 0, z-index 5); static on homepage (either is fine — make consistent).
- Padding 12px 32px; flex, space-between, wrap, gap 24px.
- Left: logo link to `/`. Right nav (14px, 400, `#4b5550`, gap 24px): **Articole** (`/#articole`), **Autori** (`/#autori`). (“Despre” and “Contact” intentionally removed — pages don't exist yet.)
- Article page only: 2px reading-progress bar at the bottom of the header, `#1da69a`, width = scroll %.

## Shared: Footer
- Background `#56625c`, margin-top 48px. Inner: padding 72px 32px 40px; grid `repeat(auto-fit, minmax(min(100%,320px),1fr))`, gap 56px.
- Col 1: "MESAJE CREȘTINE" (18px, 300, 0.14em) · quote in Source Serif 4 italic 300, 22px/1.5, `#f4f7f5`: „Căutați mai întâi Împărăția lui Dumnezeu și dreptatea Lui, și toate aceste lucruri vi se vor da pe deasupra.” · "Matei 6:33" 14px 400 `#c5d3cd`.
- Col 2: Contact form — label "CONTACT" (13px uppercase 0.18em `#bcd9d4`); inputs Nume, Email, textarea Mesaj (rows 4): 16px Roboto 300, padding 12px 14px, min-height 46px, bg `#4d5853`, border `#7b8781`, white text; submit "Trimite" bg `#1da69a`, white, 15px 400, padding 12px 28px. On success label becomes "Mulțumim!". (Wire to a form service / Astro endpoint.)
- Bottom bar: border-top `#6b7670`, padding 24px 32px 32px, 13px `#c5d3cd`: "© 2021–2026 Mesaje Creștine" left, "Facebook" link right (https://www.facebook.com/Mesaje-Cre%C8%99tine-100365085780276).

## Screen 1: Homepage (`Homepage Redesign.dc.html`)
1. **Verse band** — bg `#56625c`, inner padding 56px 32px 52px, gap 18px. Verse in Source Serif 4 300, `clamp(20px, 2.7vw, 31px)`/1.3, full container width, `#f4f7f5`, wrapped in „…”. Reference row: 32×1px line `#9fc9c2` + "Luca 21:36" (15px 400 `#dfe8e4`) + "VDCL 31" (300 `#b3c2bc`). Verse should be configurable (frontmatter/site config). An alternative light variant exists in the file (centered, italic, bg page color) — default is the dark one.
2. **Main** (`#articole`) — padding 72px 32px 40px, grid gap 56px.
3. **Featured (latest) post** — grid `repeat(auto-fit, minmax(min(100%,420px),1fr))`, gap 48px, items centered. Left: image 4:3, `object-fit: cover`, radius 2px, links to article. Right (gap 18px): label "CEL MAI RECENT · 22 OCTOMBRIE 2026" (13px, 400, 0.12em, uppercase; label `#2c8c84`, dot `#9aa59f`, date `#6b7670`, gap 12px); title h1 Roboto 300 `clamp(32px,3.6vw,44px)`/1.15 `#2f3532`; author 15px 400 `#56625c`; excerpt Source Serif 4 19px/1.65 `#434b47`; "Citește articolul →" 15px 400 teal.
4. **Article list** (`#autori`) — border-top `#e2e8e5`, padding-top 48px, gap 32px.
   - Row: "Articole" h2 (30px 300) + author filter chips (wrap, gap 8px). Chips: Toți, Stephen Kaung, Erich Sauer, A.B. Simpson, Charles H. Spurgeon, D.M. Panton. Chip: 14px 400, padding 8px 16px, min-height 36px, radius 999px. Inactive: transparent, border `#d3dcd7`, text `#4b5550`. Active: bg+border `#56625c`, white text. Filtering is client-side (small island or vanilla script) — or link to `/authors/<slug>/` pages.
   - Grid: two columns `repeat(auto-fit, minmax(min(100%,420px),1fr))`, column gap 56px (single-column variant: `minmax(0,760px)`).
   - Card: padding 28px 0, border-bottom `#e8ede9`, gap 10px. Meta row 13px 400 `#6b7670`: author · date (dot `#b0bab5`, gap 10px). Title 26px/1.25 Roboto 300 teal `#2c8c84`. Excerpt Source Serif 4 17px/1.6 `#4b5550` (toggleable).
   - Pagination centered, gap 6px: 40×40 cells, 15px 400. Current: bg `#56625c`, white, radius 2px. Others `#4b5550`; ellipsis `#9aa59f`; next arrow "→" teal.

## Screen 2: Article page (`Article Page.dc.html`)
1. **Title block** (editorial) — bg page color. Inner `max-width:1040px`, padding 72px 32px 40px, centered text, gap 20px:
   - Author link (uppercase, 13px, 400, 0.16em, `#2c8c84`) → `/authors/<slug>/`
   - Date (14px 400 `#6b7670`, directly under author, -10px top offset)
   - h1 Roboto 300 `clamp(34px,4.8vw,54px)`/1.12 `#2f3532`
   - Share links row (gap 20px, 14px 400 `#56625c`): Facebook (sharer.php?u=URL), WhatsApp (api.whatsapp.com/send?text=URL), "Copiază link" button → copies URL, label becomes "Link copiat".
2. **Hero image** — full-bleed (100% viewport width), aspect 21:8, `object-fit: cover`, no radius.
3. **Body** (`<Content/>` from Markdown) — `max-width:1040px`, padding 64px 32px 32px, vertical gap 24px between blocks. Source Serif 4, 19px (17/19/21 user size option), line-height 1.75, `#3a423e`. Element styling (target via `.prose` styles on rendered Markdown):
   - `p` — margin 0
   - `blockquote` — padding-left 24px, 2px solid `#1da69a` left border, italic, `#2f3532` (scripture; reference inline after " – ")
   - `em` paragraphs — prayers, italic
   - `h2` — Roboto 300, 1.5em/1.25, `#2f3532`, margin-top 16px
   - `strong` — weight 500
   - `a` — `#2c8c84`, hover `#1d6d66`
   - The body is intentionally simple Markdown — no custom components.
4. **Source note** — Roboto 14px/1.6 `#6b7670` (e.g. "Mesaj rostit în data de … Continuarea mesajului „…”").
5. **Author box** — top/bottom border `#e2e8e5`, padding 28px 0, flex gap 20px: 56px circle avatar (placeholder), label "AUTOR" (12px uppercase 0.14em `#6b7670`), name 18px 400 `#2f3532`, right-aligned "Toate articolele →" 14px teal.
6. **"Citește și"** — container 1440px, padding 48px 32px 24px. Header row: h2 "Citește și" 28px 300 + "← Articolul anterior: <title>" 15px 400 teal. Grid `repeat(auto-fit, minmax(min(100%,280px),1fr))` gap 32px; card = 3:2 image + title 22px/1.3 300 teal.

## Interactions
- Link hover: `#2c8c84` → `#1d6d66`. Button hover: `#1da69a` → `#17897f`.
- Reading-progress bar (article): passive scroll listener, width = scrollTop / (scrollHeight − clientHeight).
- Author filter, copy-link, contact form success state as described above.
- Responsive: all grids use `auto-fit/minmax` and collapse to one column on narrow screens; no fixed heights.

## Assets
- Featured/hero image: https://mesaje-crestine.ro/wp-content/uploads/2025/07/alexey-elfimov-01huESAdPAQ-unsplash-scaled.jpg (use Astro `<Image/>`; per-post `image` frontmatter).
- Author avatars and related-post images: not supplied yet (striped placeholders in design).

## Files
- `Homepage Redesign.dc.html` — homepage reference
- `Article Page.dc.html` — article reference
- `support.js` — runtime needed only to open the references in a browser
