# Decisions

Why a question was settled the way it was. Newest first, append only; a reversal is a new
entry that names the one it supersedes. Read before reopening a settled question.

- **2026-10-23** Cut-over now, without a last import (nothing new on WordPress) and without a
  full cPanel backup (owner: what matters is already kept, the database stays on the host).
  Supersedes the backup step of `workflow.md` for this cut-over: WordPress's files are moved
  into a closed `_wordpress/`, not deleted, and deleted only two weeks later with a yes.
- **2026-10-23** WordPress leftovers (owner, after the list of old URLs not imported): the
  three quotes become posts (supersedes their 301s to related posts in the entry below); every
  author term gets a page, even with no posts, `noindex` and out of the sitemap under two
  posts (`seo.md` forbids empty pages: noindex keeps them out of Google); `necunoscut` keeps
  its page; the zip `fragmente-lda.zip` is dropped, the owner downloaded it.
- **2026-10-23** Remaining old URLs (owner, on the `seo` agent's proposal,
  `specs/wordpress-import.md`): 301 only to a page on the same subject, else 410. Old cover
  images 301 to their post, portraits to their author page, the rest of `/wp-content/` 410.
  `/despre-noi/` answers 410: there is no About page and it was never linked (supersedes the
  2026-10-22 entry that built it as a page). At cut-over WordPress's files are removed but
  its database stays on the host; a full cPanel backup is still downloaded first, since the
  uploads are in neither the database nor git. The app (PWA) uses the header's `#f3f6f5` as
  theme colour and no longer locks portrait.
- **2026-10-23** Privacy page operator (owner): `/confidentialitate/` names Gabriel Gavrilut
  as the operator, reachable through the contact form. Considered and set aside: no name
  ("administratorul site-ului"), which falls short of GDPR art. 13(1)(a), and an initial.
- **2026-10-23** Brand images (owner), superseding 2026-10-22 site images: the owner supplies
  the finished files in `public/` (`logo.svg`, `mark.svg`, the favicons, `apple-touch-icon.png`,
  `og-default.png`), and `logo.svg` replaces the monogram as the JSON-LD logo. The generator
  `bin/make-brand-images.ts` is deleted, because it overwrote those files with the old teal
  set. The logo's text is drawn as outlines, so it looks the same without Roboto.
- **2026-10-23** The PDF of `o-mantuire-asa-de-mare` (owner): kept, linked under the title as
  on WordPress, where it sat above the article. It lives in the post folder as the post's
  `pdf`, so any post can have one, and its old `/wp-content/uploads/` URL gets a 301.
- **2026-10-23** Next work (owner): citations under the articles are imported with their
  links (`source`); Google Analytics uses Consent Mode v2 "advanced" (gtag loads for everyone,
  cookieless pings until consent); the agent drafts the privacy page `/confidentialitate/`
  and the owner reviews it before it goes live; the PWA is refreshed (short name "Mesaje
  Creștine", the new mark as icon, standalone display) but keeps the old manifest URL
  `/superpwa-manifest.json`, its identity (`start_url` `/`) and the service-worker URL
  `/superpwa-sw.js`, so installed users get the update instead of losing the app; the
  post-writer agent writes the 73 meta descriptions and the owner reviews them as one diff.
- **2026-10-23** Contact form (owner): the secrets live in `mesaje-crestine-contact.php`,
  which the owner creates in the cPanel home folder, above `public_html`, so they never pass
  through git, FTP or the web folder; the deploy account cannot reach it, by design. SMTP
  through PHPMailer 7.1.1 (copied unmodified into `public/_lib/`), not a hand-written client.
- **2026-10-22** Author portraits (owner): the ten portraits in the WordPress media library
  that belong to authors of the site are imported (`PORTRAITS` in `bin/import-wp.ts`); the
  other sixteen authors keep the design's striped circle until the owner supplies one.
- **2026-10-22** Visual design (owner): the redesign handed off in
  `design/design_handoff_mesaje_crestine/` replaces the WordPress look, which had been rebuilt
  the same day. Post dates stay visible, as both the handoff and `seo.md` want.
- **2026-10-22** Site images (owner): the WordPress "MC" monogram (192×192) stays the logo
  in JSON-LD; the favicon set and the default social card are new, drawn from
  `src/brand/mark.svg` by `bin/make-brand-images.ts`, because the monogram's ring text is
  noise at favicon size. The card is the `og:image` of every page and coverless post, but
  not a post's JSON-LD `image`, which Google wants to represent the article.
- **2026-10-22** `despre-noi` and `contact` are not imported (owner): on WordPress the first
  is a theme demo placeholder and the second only the form. Both are built as new pages at the
  same URLs, the about text from the owner, the form from the contact-form spec.
- **2026-10-22** Import findings settled by the owner: a post's `author` may list several
  authors, and a post with none is imported as a draft; `cover` (and until the post writer's
  pass, `coverAlt`, `description`, `related`) is optional for imported posts only; a video
  inside an article's text is a line holding only its YouTube URL, at its original place.
- **2026-10-22** The importer reads a post from its rendered page whenever the page has no
  `post-content` element (developer): `rugaciune`'s REST content holds 69 of the 385 words
  readers see, so the page, not the API, is the text.
- **2026-10-22** Dependencies (owner approved the list): `astro` 7, `@astrojs/markdown-satteri`
  at Astro's own version (to switch off smart punctuation), and for development
  `@astrojs/check`, `typescript` 6 (the newest `@astrojs/check` supports), `cheerio`,
  `@types/node`. `@astrojs/sitemap` was approved but dropped: the sitemap is built from the
  collections so `lastmod` follows real changes and one-post author pages stay out
  (`seo.md`). HTML becomes Markdown through our own converter, not turndown, which escapes
  text in ways that break the text check.
- **2026-10-22** Publishing runs as fixed phases, one specialist each (owner): `bin/fetch-doc`
  (a script: it guards the text, so no model in that step), `post-writer`, `publisher`
  prepare, `seo-reviewer` (read-only gate, separate from the `seo` strategist so the check is
  narrow and consistent), the owner's yes, `publisher` upload. Orchestrated by the `/publish`
  skill in the main session. Supersedes the developer running `seo` before deploys (below).
- **2026-10-22** Every deploy is preceded by an SEO review by the `seo` subagent, run by the
  developer (owner's requirement). Subagents cannot launch subagents in Claude Code, so the
  agent that deploys runs it, not the post writer (`workflow.md`).
- **2026-10-22** The post writer accepts a Google Doc link, downloaded with `curl` from the
  export URL, never through WebFetch, whose model rewrites text; WebFetch is removed from the
  post writer's tools (`content-model.md`).
- **2026-10-22** The contact form is a PHP handler on the host that sends through SMTP from a
  cPanel mailbox on the domain, to the owner's address kept in the server-side config, not in
  git. No Mailjet: the domain already publishes SPF, DKIM and DMARC for the host's mail
  (checked with `dig`, 2026-10-22), so Gmail accepts it. Anti-spam: Cloudflare Turnstile,
  verified server-side, plus a honeypot field.
- **2026-10-22** Analytics: GA4, kept for its history, behind a small self-built consent
  banner with Consent Mode v2 (denied by default). The owner needs visits, time per visit,
  pages and source; GA4 cannot be fully cookieless, and the free cookieless tools lack time
  per visit. Only consenting visitors are fully counted.
- **2026-10-22** Deploy: a small Node script using `basic-ftp` over FTPS, so it runs the same
  on any machine with Node and needs no system package. The owner had no preference; the
  dependency lands with the deploy spec.
- **2026-10-22** Cut-over: the new site replaces WordPress in the same cPanel account, and
  WordPress is removed. Search Console is verified by a DNS TXT record, so the verification
  survives.
- **2026-10-22** Categories dropped for now: 69 of 73 posts are "Uncategorized". Old
  `/category/…` URLs 301 to the archive.
- **2026-10-22** Videos are YouTube links only.
- **2026-10-22** Site content is Romanian only, for now (owner). No i18n is built until a
  second language is actually planned. URLs carry no language prefix, so Romanian pages keep
  their URLs if one is added later (`seo.md`, language and locale).
- **2026-10-22** Three agents: a developer (`AGENTS.md`) and two Claude Code subagents, `seo`
  and `post-writer`, each with its own role generated from `agent/<name>/`. Diverse expertise
  is the case the guide accepts for more than one agent. The template's "subagents never
  write" is relaxed: each may write only its own files (`agent/design.md` §4).
- **2026-10-22** The post writer never changes the text; it structures, adds metadata and
  links through front matter. Owner's requirement; enforced by the `source.txt` comparison.
- **2026-10-22** Astro, static output. Pre-rendered HTML and almost no JS fit a content blog
  that must score well on Core Web Vitals; posts live in git as Markdown.
- **2026-10-22** Hosting: the owner's cPanel shared hosting, deployed by FTP. Apache, so
  redirects and cache headers go in `.htaccess`.
- **2026-10-22** Article URLs change from `/YYYY/MM/<slug>/` to `/<slug>/`, each old URL with
  a 301. Owner's choice; author pages keep `/authors/<slug>/`.
- **2026-10-22** SEO follows Google and Bing documentation, not the current WordPress setup,
  which the owner judged poorly configured (baseline in `seo.md`).
- **2026-10-22** Kept from WordPress: contact form, analytics, search, author pages. Not
  kept: categories (entry above), the Mailjet newsletter and the PWA plugin. Comments: none exist, none planned.
- **2026-10-22** Posts are produced only through the post writer; no CMS or admin UI.
- **2026-10-22** Agents answer in English; files in English; site content Romanian.
