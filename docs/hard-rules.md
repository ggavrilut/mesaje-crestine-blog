# Hard rules

The short list of things that must never happen here, and why. Read before any write. A rule
enters this table only with the incident or the source behind it; "be careful" is not a rule.

| Never | Because | Instead |
|---|---|---|
| Put a secret (FTP password, API key, personal data) in a file, a commit or the chat | Git and chat transcripts never forget; rotating the secret is the only fix | The git-ignored `.env`; `dev-environment.md` names the variables, never the values |
| Store a project fact in the harness's private memory, or leave it in the chat | `~/.claude/` is per machine and outside git: invisible to the other agents and to the next clone | The `docs/` file that owns the topic; `docs/state.md` for open items |
| Run anything irreversible (delete, force-push, deploy, send) without a yes in this session | It cannot be undone, and an approval given for an earlier task does not carry over | Show the exact command, wait for the yes |
| Change, add, remove or reorder a word, punctuation mark or diacritic of an article's text, even to fix a typo | Owner's requirement (2026-10-22): the texts are the authors' and translators' words, published as given | Formatting only (`content-model.md`); report suspected typos to the owner |
| Upload to the FTP host or touch `public_html` without a yes in this session | It replaces the live site for every visitor at once | `workflow.md`, deploy step: show the command, wait for the yes |
| Write to the live WordPress site, its database or its uploads | It stays the live site until cut-over, and the import must be repeatable | Read the public REST API and pages only |
| Remove or change a public URL without a 301 in the redirect map | Its rankings and inbound links are lost (Google, "Site moves with URL changes") | Add the redirect in the same commit (`seo.md`, the move) |
