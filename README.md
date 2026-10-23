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

Requires Node 24 and npm. `npm install`, then `npm run dev` for the site on
`http://localhost:4321/`; every command and what it should print is in
`docs/dev-environment.md`.

## Working with the AI agents

Read `docs/working-with-the-agent.md`: how to install a harness, the agents and how to call
them, how to work with them and how to teach them.

## Map

| Where | What |
|---|---|
| `AGENTS.md` (= `CLAUDE.md`) | The developer agent: loaded with every request |
| `.claude/agents/` | The subagents: `seo`, `post-writer`, `seo-reviewer`, `publisher` |
| `.claude/skills/publish/` | `/publish`: the phase-by-phase publishing pipeline |
| `docs/` | Project knowledge, one topic per file; `docs/specs/` one spec per feature |
| `docs/state.md` | What is in flight, open questions, declined proposals |
| `agent/` | Sources of each agent's Role block, design record |
| `evals/` | Behaviour scenarios, run after any change to an agent |
| `bin/` | `check` (the fast check: run before committing), `fetch-doc`, `import-wp.ts`, `check-redirects.ts` |
| `src/` | The Astro site |
| `content/` | Posts and authors |
| `import/` | The WordPress import's report, old URL list and redirect list |
