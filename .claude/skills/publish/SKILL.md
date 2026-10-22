---
name: publish
description: Publishes one article from a Google Doc link (or pasted text) to mesaje-crestine.ro, phase by phase - fetch, compose, SEO review, prepare, owner's yes, upload, verify. Use when Gabriel types /publish. Skipping or reordering a phase can put an altered or unreviewed article live.
disable-model-invocation: true
---

# Publishing an article

**Nothing is uploaded without Gabriel's yes, given in this session, for the exact commit
the publisher prepared.** A yes for an earlier commit or an earlier article does not count.
The article's text is never changed by any phase (`docs/hard-rules.md`).

Subagents cannot launch subagents or stop to ask, so this session runs each phase and every
stop happens here. Copy this checklist into your reply and tick it as you go:

- [ ] 1. **Fetch**: `bin/fetch-doc <link> <slug>`. Not shared, or not a doc → stop, ask
  Gabriel to share it "Anyone with the link: Viewer". Pasted text instead of a link → skip
  to 2. No link or text (a code-only deploy) → start at 3.
- [ ] 2. **Compose**: `post-writer` subagent with the fetched folder (or the pasted text),
  plus any metadata Gabriel wrote after the link in his `/publish` message. Missing title or
  author → stop, ask. Its report lists suspected typos: show them and stop;
  Gabriel fixes them in the doc (→ back to 1) or says continue.
- [ ] 3. **Build**: `publisher` subagent, "prepare". A failed check or a text-integrity
  difference → stop; the owning agent fixes it (→ back to 2).
- [ ] 4. **SEO review**: `seo-reviewer` subagent on the pages step 3 listed as changed.
  FIX FIRST → show the findings; the post writer fixes metadata (→ back to 2), the developer
  fixes layouts. Never skip this step, even for a typo fix.
- [ ] 5. **Ask**: show Gabriel, in one message, the SEO verdict, the list of host changes and
  the exact upload command from step 3, with the commit hash. Stop for his yes.
- [ ] 6. **Upload**: `publisher` subagent, "upload", passing the approved commit hash. A
  commit made after the yes → back to 3.
- [ ] 7. **Verify**: the publisher's live check. A failure → report what the live site shows
  now; no retry without a new yes.
- [ ] 8. **Commit** when Gabriel asks: `Add post: <title>` (`docs/conventions.md`).

Not built yet (2026-10-22): the Astro build and the deploy script
(`docs/specs/publish-pipeline.md`). If a phase's tool is missing, stop and say which.
