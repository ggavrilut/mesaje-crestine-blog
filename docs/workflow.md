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
| New post | the `post-writer` agent from the owner's input (`content-model.md`) | Gabriel reviews the diff |
| Verify | `bin/check`, then the checks in `testing.md` | |
| Commit | `conventions.md` | when asked |
| Deploy | FTP upload of `dist/`; the command is written here with the deploy spec | Gabriel, every time |
