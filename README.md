# Mesaje Creștine

The rewrite of [mesaje-crestine.ro](https://mesaje-crestine.ro/), a Romanian blog of Christian
articles by many authors, from WordPress to a static Astro site built to be found by search
engines. Done means: every existing article, author and image imported with its text
untouched, every old URL redirected, the site live on the owner's cPanel hosting, and new
posts published through the post-writer agent.

Built against the guide in `/home/gabriel/work/ai-project-setup/` (Part 1 for the repo setup,
Part 2 `docs/building-agents-checklist.md` for the agents). Knowledge is copied from there,
not linked: when the guide changes, the copies here are updated by hand.

## Setup

Not scaffolded yet: the Astro site arrives after the import spec is agreed
(`docs/state.md`). Requires Node 24 and npm. The commands will be in `docs/dev-environment.md`.

## Working with the AI agents

Read `docs/working-with-the-agent.md`: how to install a harness, the three agents and how to
call them, how to work with them and how to teach them.

## Map

| Where | What |
|---|---|
| `AGENTS.md` (= `CLAUDE.md`) | The developer agent: loaded with every request |
| `.claude/agents/` | The `seo` and `post-writer` subagents |
| `docs/` | Project knowledge, one topic per file; `docs/specs/` one spec per feature |
| `docs/state.md` | What is in flight, open questions, declined proposals |
| `agent/` | Sources of the three Role blocks, design record |
| `evals/` | Behaviour scenarios, run after any change to an agent |
| `bin/check` | The fast check: run before committing |
| `src/` | The Astro site (to come) |
| `content/` | Posts and authors (to come) |
