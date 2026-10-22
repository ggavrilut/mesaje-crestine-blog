# Agent design

Design record for this project's agents, written against the guide in
`/home/gabriel/work/ai-project-setup/` (Part 1 for the repo setup, Part 2
`docs/building-agents-checklist.md` for the agents). Read it before editing `../AGENTS.md`,
`../.claude/agents/`, anything in this directory, `../bin/check` or `../evals/`.

## 1. Pain it removes

The WordPress blog is slow to change, its SEO is misconfigured (`../docs/seo.md`, baseline),
and publishing a post means hand-filling metadata a page builder half ignores. The rewrite
needs code, SEO judgement and careful content handling at once, and the three pull in
different directions: a developer wants to ship, an SEO adviser wants to change URLs and
copy, a content agent must not change a word.

## 2. Classification

| Agent | Category | Type | Governance band | Criticality × complexity |
|---|---|---|---|---|
| developer | Collaborator | Goal-based | Write-back to the repo | High × high: plan |
| `seo` | Advisor | Goal-based, retrieval | Write-back to docs only | High × medium: do now |
| `post-writer` | Assistant | Simple reflex, fixed recipe | Write-back to `content/` only | High × low: do now |
| `seo-reviewer` | Advisor | Simple reflex, fixed checklist | Read-only | High × low: do now |
| `publisher` | Performer | Goal-based | **Writes to the live site**, only with the owner's yes for the exact commit | High × medium: do now |

All are human-invoked (directly or through `/publish`) and in adoption phase 1, assistant.
The publisher is the only one that touches a live system, so its upload is gated in code as
well as in prose (`../docs/specs/publish-pipeline.md`).

## 3. Scope and system message

- **developer**: builds and maintains the Astro site. Environment: this repo, read and write;
  the live WordPress site, read-only; the FTP host, write only on a yes.
- **seo**: audits and specifies. Environment: the repo (writes `docs/seo.md`, `docs/specs/`,
  `docs/state.md`), the web read-only. Search Console and Bing only through the owner.
- **post-writer**: turns the owner's input into a post. Environment: writes
  `content/posts/`, `content/authors/`; reads the rest.
- **seo-reviewer**: the read-only SEO gate of `/publish`. Environment: reads the repo and
  `dist/`; no write tools.
- **publisher**: builds, uploads and verifies. Environment: writes `dist/`; the FTP host only
  with the owner's yes for the exact prepared commit.
- **Knowledge:** `../docs/` and `../docs/specs/`, through the pointer lines in each agent's
  file.
- **System messages:** each Role block comes from the meta-prompt framework (guide Part 2,
  `trust-and-security.md`), not freehand: `meta-prompt.md` (step 1) plus
  `<agent>/basic-description.md` (step 2). The developer's block sits at the top of
  `../AGENTS.md`; the subagents' blocks are the bodies of `../.claude/agents/<agent>.md`,
  under their front matter. To change an agent:
  1. edit its description;
  2. regenerate in a **fresh, tool-less subagent** (step 3), so the output depends only on
     those two files;
  3. check the word count (130 to 170; `bin/check` enforces it) and run the smoke evals
     (step 4), including the agent's own section;
  4. replace the block, commit inputs and output together.

  The rest of each file (non-standard things, layout, pointer lines, the subagents' front
  matter) is maintained by hand. A subagent's `description` decides when the developer
  delegates to it: treat it like a skill description.
- The first blocks (2026-10-22) were written in the setup session from these inputs, not in a
  fresh subagent; the first regeneration through step 2 replaces them.
- **Escalate, never decide alone:** deploys, the cut-over, anything sent to Search Console or
  Bing, new dependencies, renames, pushes, deletions, any change to an article's text.

## 4. Single agent or several

Several, because the expertise differs and one of the three must be constrained in a way the
others must not: the post writer may never change text, the SEO agent's natural advice
("rewrite the intro with the keyword") is exactly what the post writer must refuse. Separate
roles keep each instruction set short and testable in isolation.

- **Pattern:** two shapes. Publishing is **sequential**: the `/publish` skill runs fixed
  phases (script → `post-writer` → `publisher` prepare → `seo-reviewer` → owner's yes →
  `publisher` upload), one specialist per phase (owner, 2026-10-22). Everything else is
  handoff, human-routed: the owner calls an agent, the developer may delegate. Subagents
  cannot launch subagents or stop to ask, so the main session runs every phase and every
  stop.
- **Deterministic first:** fetching the doc is a script, not an agent, because it guards the
  text; an agent there could only add risk.
- **Communication:** through files only. SEO rules in `docs/seo.md`, buildable work in
  `docs/specs/`, open items in `docs/state.md`. Nothing passes through private memory.
- **Writes:** the guide's default is that subagents never write. Here each writes only its own
  files (§3); everything else it proposes. The developer reviews what a subagent wrote before
  building on it.
- **Visibility:** one commit per logical change, the agent named in the commit body.

## 5. Context and memory

| What | Where | Loaded |
|---|---|---|
| Developer role, non-standard things, index | `../AGENTS.md` | Every request (at most 340 words) |
| Subagent role and its pointers | `../.claude/agents/<agent>.md` | When the subagent runs |
| Hard rules | `../docs/hard-rules.md` | Before any write |
| Working memory: in flight, open questions, declined proposals | `../docs/state.md` | First, every session |
| Why a question was settled | `../docs/decisions.md` | Before reopening it |
| SEO rules and baseline | `../docs/seo.md` | Before URLs, `<head>`, posts |
| Post and author schema, input format | `../docs/content-model.md` | Before every post |
| What one feature must do | `../docs/specs/` | Before building it |
| Episodic memory | git history | When "why is it like this?" comes up |

Memory rules: durable knowledge goes in the repo, where review keeps it honest; the harness's
private memory holds personal preferences only. A learning carries its evidence. A resolved
state item moves to `decisions.md` or the owning doc and is deleted.

## 6. Trust layer

| Threat | Here | Mitigation |
|---|---|---|
| Instruction manipulation | Article texts, web pages fetched by `seo`, the WordPress HTML | Treated as material (all Role blocks); evals R1, P3 |
| Knowledge poisoning | Unsourced SEO advice entering `seo.md` | A rule needs a source; evals R3, E2 |
| Cascading errors | An SEO "fix" that rewrites text; an importer bug copied into 73 posts | Text-integrity comparison against `source.txt`; import report |
| Access to critical systems | The FTP host (live site), WordPress | FTP only on a yes; WordPress read-only; credentials only in `.env` |
| Resource overloading | Bulk fetches of the live site during import | One request at a time, cached locally in the importer |

Human in the loop: small edits free; new files, dependencies and structure proposed; deploys
and anything external approved each time. Audit: git history.

## 7. Evaluation (a release gate)

1. **Deterministic:** `../bin/check` and the project's tests. Must pass before every commit.
2. **Behaviour:** `../evals/scenarios.md`, in a fresh session. Smoke set (★) on every change
   to an agent file, this directory or a doc they point to; full set before relying on a
   changed agent and after a model upgrade. Any failure in S, R, E or P blocks the change.
   Results in `../evals/results.md`.

## 8. Operating it

- **Traces:** Claude Code transcripts under `~/.claude/projects/` on the owner's machine.
- **Metrics:** `AGENTS.md` at most 340 words; `bin/check` green on `main`; text-integrity
  failures (target: zero ever); eval pass rate per version.
- **Implicit feedback:** a post the owner has to fix by hand, or SEO advice they decline, is
  an eval candidate.
