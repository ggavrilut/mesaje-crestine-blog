# Decisions

Why a question was settled the way it was. Newest first, append only; a reversal is a new
entry that names the one it supersedes. Read before reopening a settled question.

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
