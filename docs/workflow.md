# Workflow

How work flows from request to the live site. Read before any deploy.

**Irreversible steps, before the steps:** every FTP upload to the host (it replaces the live
site), the cut-over from WordPress, and anything submitted to Search Console or Bing. Each
needs a yes in the session that runs it. **The cut-over deletes WordPress: a full cPanel
backup (files and database) is downloaded and opened on the owner's machine before anything
is deleted.**

| Step | How | Who approves |
|---|---|---|
| Pick work | `state.md` "In flight", or the owner's request | Gabriel |
| Feature | a spec in `specs/`, agreed, then built by the developer agent | Gabriel |
| SEO change | the `seo` agent writes the rule in `seo.md` or a spec; the developer builds it | Gabriel |
| New post | `/publish <Google Doc link>`: the phases below | Gabriel, at the stops |
| Verify | `bin/check`, then the checks in `testing.md` | |
| Commit | `conventions.md` | when asked |
| Deploy | `/publish` (no link for a code-only deploy: phases 3–7) | Gabriel, every time |

## Publishing: one specialist per phase

Run by the `/publish` skill (`.claude/skills/publish/SKILL.md`) in the main session, because
subagents cannot launch subagents or stop to ask. Spec: `specs/publish-pipeline.md`.

| # | Phase | Owner | Writes | Stops when |
|---|---|---|---|---|
| 1 | Fetch the doc, exactly | `bin/fetch-doc` (script) | `source.txt`, `source.md`, images | the doc is not shared |
| 2 | Compose: layout, metadata, author, related | `post-writer` | the post folder | title or author missing; typos to decide |
| 3 | Prepare: build, checks, list of host changes | `publisher` | `dist/` | any check fails |
| 4 | SEO review of the changed pages | `seo-reviewer` (read-only) | nothing | FIX FIRST |
| 5 | Ask | main session | nothing | always: Gabriel's yes for the exact commit |
| 6 | Upload | `publisher` | the live site | |
| 7 | Verify live URLs | `publisher` | nothing | a URL fails |

**The SEO review is not optional** (owner, 2026-10-22), not even for a typo fix. A finding
the owner overrides is noted in the commit body.
