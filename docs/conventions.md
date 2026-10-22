# Conventions

Code style, naming, commit format. Read before writing code or a commit. Only what a linter
cannot enforce belongs here; the rest goes in the linter config.

- Code: TypeScript in Astro components and scripts; English identifiers and comments.
- Site text (UI labels, metadata the agents write): Romanian with comma-below `ș ț`.
- Files: UTF-8, LF line endings. Content folders and slugs: lowercase ASCII, hyphens.
- Branches: work on `main` while it is a one-person project; a branch for anything risky
  (the importer, the cut-over).
- Commits: imperative subject, body says why, one logical change per commit. One post per
  commit: `Add post: <title>`.
