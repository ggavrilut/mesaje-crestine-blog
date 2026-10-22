# Publish pipeline

Status: draft · Owner: Gabriel Gavrilut · Last updated: 2026-10-22

## Goal

Gabriel types `/publish <Google Doc link>` and the article goes live through fixed phases,
each owned by a specialist, with his yes before the upload. The text on the site is the text
in the doc, character for character.

## Non-goals

- Proofreading the text: declined 2026-10-22 (`state.md`); the post writer only flags typos.
- Scheduling posts for later; publishing several articles in one run.

## Behaviour

- [ ] `bin/fetch-doc <link> <slug>` writes `content/posts/<slug>/source.txt` (the
  `format=txt` export above the last `---` line, leading BOM stripped, nothing else),
  `meta.txt` (below it), `source.md` (the `format=md` export) and any embedded images; exits
  non-zero with a clear message when the doc is not shared or the link is not a Google Doc.
  Built 2026-10-22; on a real doc `source.txt` is the export minus the BOM, byte for byte.
  A doc without a metadata block keeps the whole text and an empty `meta.txt`. The split at
  a real metadata block is not yet tested on a doc.
- [x] Running `bin/fetch-doc` twice on an unchanged doc gives identical files (2026-10-22).
- [x] The text-integrity check (`content-model.md`) fails the build when a post body differs
  from its `source.txt` (`src/integrations/build-checks.ts`; one changed diacritic failed the
  build, 2026-10-22).
- [ ] The publisher's "prepare" lists the files the upload adds, changes and deletes on the
  host, and the exact command; it never lists `.well-known/` or `.ftpquota` for deletion.
- [ ] The deploy script refuses to upload unless it is given the commit hash that was
  prepared and that commit has an SEO review recorded as PUBLISH.
- [ ] After upload, the publisher checks each new or changed URL for 200 and each new
  redirect for a single 301.
- [ ] Every phase of `.claude/skills/publish/SKILL.md` has a tool that exists.

## Data and interfaces

Inputs: a Google Doc shared "Anyone with the link: Viewer"; `.env` for FTPS. Outputs: the
post folder, `dist/`, the live site. The SEO review record (verdict and commit) lives in a
git-ignored file the deploy script reads.

## Open questions

- Embedded images: the first sample had none; confirm on the first doc that has one.

## Done when

- [ ] every Behaviour line passes and the test that proves it exists
- [ ] `docs/` updated wherever the feature changed a rule, a flow or a command
- [ ] Status set to built; `docs/state.md` cleared of this feature
