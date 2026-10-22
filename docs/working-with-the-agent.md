# Working with the AI agent

For the people on this project. The agent reads `AGENTS.md` and the `docs/` files it points
to; you read this. Written for someone who has never used a coding agent.

## 1. Install a harness

A harness is the program that runs the model, reads the files and executes the commands. Any
harness that reads `AGENTS.md` works here; which model runs inside it is the harness's
business.

**Claude Code**, the reference setup:

```sh
# macOS / Linux
curl -fsSL https://claude.ai/install.sh | bash
# Windows (PowerShell)
irm https://claude.ai/install.ps1 | iex
# alternatives: brew install --cask claude-code · npm install -g @anthropic-ai/claude-code

claude --version   # prints a version; "command not found" means the install dir is not on PATH
claude update      # later
```

The first `claude` run opens a browser to log in, with a claude.ai subscription or a Console
account; inside a session, `/login` switches accounts. On Windows, where a symlink needs admin
rights, `CLAUDE.md` can instead be a real file containing the single line `@AGENTS.md`; the
symlink line of `bin/check` then fails on that machine, and nothing else does.

Other harnesses, one line each. All read `AGENTS.md`; only the skill folder differs.

| Harness | Reads `AGENTS.md` | Note |
|---|---|---|
| Codex CLI (OpenAI) | natively | |
| Cursor | natively | |
| Gemini CLI | after `{"context": {"fileName": "AGENTS.md"}}` in `.gemini/settings.json` | reads `GEMINI.md` by default |
| GitHub Copilot | through `.github/copilot-instructions.md` | shipped with this repo |
| Deep Code (`@vegamo/deepcode-cli`, DeepSeek models) | natively | skills live in `.agents/skills/` |

## 2. Open the project

```sh
cd <project>
npm install # once, and after a pull that changed package.json
bin/check   # the setup is intact: symlink, budget, pointer lines, links, no placeholder left
claude      # or the harness you installed
```

Launch from the repo root. A harness loads the instruction files of the folder it starts in
and of that folder's parents, not of the folders it later edits.

What the agent receives with every message: the harness's own system prompt, **the whole of
`AGENTS.md`**, the name and description of every skill, then your message. A doc is loaded
only when its pointer line in `AGENTS.md` says so. That is why `AGENTS.md` stays about 40
lines and everything else lives one link away in `docs/`.

### The agents

| Agent | Where | Call it with | It writes |
|---|---|---|---|
| developer | `AGENTS.md`, the main session | just talk to it | code, docs, specs; deploys only on your yes |
| `seo` | `.claude/agents/seo.md` | "Use the seo agent to audit …" | `docs/seo.md`, specs, `docs/state.md` |
| `post-writer` | `.claude/agents/post-writer.md` | through `/publish`, or "Use the post-writer agent: …" | `content/posts/`, `content/authors/` |
| `seo-reviewer` | `.claude/agents/seo-reviewer.md` | through `/publish` | nothing (read-only) |
| `publisher` | `.claude/agents/publisher.md` | through `/publish` | `dist/`, the live site after your yes |

**Publishing a post**: `/publish <Google Doc link>` (doc shared "Anyone with the link:
Viewer"). It runs the phases in `docs/workflow.md` and stops when you must decide: suspected
typos (fix them in the doc, or say continue), an SEO finding, and always before the upload,
where it shows the SEO verdict, what changes on the host and the exact command. `/publish`
with no link deploys code changes only. Then "commit".

The developer may also hand a task to a subagent itself. `/agents` lists them. The input
format for a post is in `docs/content-model.md`: the text, then `---`, then `Titlu:`,
`Autor:`, `Imagine:`, `Video:`, `Data:`, `Sursa:`. The post writer never changes your text;
it reports suspected typos for you to fix in the input.

## 3. The first session

1. `bin/check` must be green. It fails while a placeholder from the template is left, and a
   leftover placeholder is a fact the agent will invent.
2. Ask a routine question: "how do I run the tests?" or "I fixed X, how do I ship it?". The
   agent should open `docs/testing.md` or `docs/workflow.md` on its own. If it didn't, fix the
   pointer line in `AGENTS.md`, not the agent.
3. Read `docs/state.md` together. It is what the agent will take as true.

## 4. How to work with it

| Do | Because |
|---|---|
| One task per conversation: `/clear` between tasks, `/compact` when a long one must go on | Old context degrades every answer that follows it |
| Say the goal and the constraint, not the steps | It plans; you judge the plan |
| Let it read freely; approve every write and every command that changes state | Reads are free, writes are your responsibility |
| Read the diff before you accept it | "Done" is a claim until the check ran and you read the result |
| Never paste a secret into the chat | Transcripts are stored; see `docs/hard-rules.md` |
| Commit yourself, or ask it to, one logical change at a time | The commit history is the project's memory of why |

It stops and asks before: anything irreversible, a new dependency, a new file, a rename, a
push, and anything no rule or spec covers.

**Dates.** The agent reads `docs/state.md` when a session opens, so a check due on a given day
happens at the first session after it, however late. For a dated check it proposes a reminder
outside the repo, on a channel you already use, and makes it only on your yes:

| Channel | Reaches | Trap |
|---|---|---|
| A calendar event with an alert: the harness's calendar connector, or an `.ics` file opened in your calendar app | Every device on that calendar, your phone included | An event without an alert notifies nobody |
| A timer on the machine that runs `notify-send` or a script: a systemd user timer, launchd, Task Scheduler | That machine, when it is on | cron drops a run missed while the machine sleeps or is off; a systemd calendar timer catches up after sleep by itself, after a power-off only with `Persistent=true`. A `systemd-run` timer is gone after a reboot |
| A push service already working on your phone (ntfy, KDE Connect, …) | Your phone | Only one that already works: installing a service for a reminder is a new dependency |

Tell it once which channel you use. That is a personal preference: it goes in your private
memory (§6), not in the repo.

## 5. How to teach it

The agent starts every session with no memory of the last one. What it knows is what is in
the repo, so a lesson that is not in a file is not learned.

| You noticed | Write it in |
|---|---|
| It broke a rule nobody had written down | `docs/hard-rules.md`, with the incident |
| It ran the wrong command or missed a step | the owning doc: `testing.md`, `workflow.md`, `dev-environment.md` |
| A decision it keeps reopening | `docs/decisions.md`, dated, with the why |
| A proposal you declined | `docs/state.md`, under "Declined proposals", with the reason |
| A feature request | a spec in `docs/specs/`, from the template there |
| The same procedure typed out a third time | a skill in `.claude/skills/<name>/SKILL.md` |

Say "remember X", then check that X landed in one of these files. **Never let it add the
lesson to `AGENTS.md`**: that file is paid for on every request, forever. Grow reactively: a
rule enters after a real mistake, not to defend against one nobody has made.

## 6. Where knowledge lives

| You want to keep… | Home | Loaded | Never here |
|---|---|---|---|
| What the project is, the non-standard things, the pointers | `AGENTS.md` | Every request | Rules, procedures, setup, status |
| How it works and the rules | `docs/<topic>.md` | When its pointer line fires | Work in progress |
| In flight, open questions, **declined proposals with the reason** | `docs/state.md` | First, every session | Anything settled: it moves to `decisions.md` and is deleted here |
| Why a question was settled that way | `docs/decisions.md`, dated | Before reopening it | Live status |
| What one feature must do | `docs/specs/<feature>.md`, one row in `docs/specs/README.md` | Before building it | Rules that hold for every feature |
| A procedure done the same way every time | `.claude/skills/<name>/SKILL.md` | When its description matches | Conventions |
| Tool permissions, hooks | `.claude/settings.json` (shared), `settings.local.json` (yours, git-ignored) | By the harness | Project facts |
| How *you* like to work: language, verbosity | `~/.claude/CLAUDE.md`, the harness's auto memory | Your machine only | **Any project fact** |

**A project fact goes in the repo, in the file that owns the topic; private memory holds
personal preferences only.** The harness's auto memory (for Claude Code,
`~/.claude/projects/<project>/memory/`) is per project by name but per machine in fact:
outside git, invisible to the team and to other tools, gone on the next clone, reviewed by
nobody. The right place for "answer in Romanian"; the wrong place for "the API rejects empty
lists". A team that wants no private memory at all sets `"autoMemoryEnabled": false` in
`.claude/settings.json`.

## 7. Keeping it current

- `bin/check` before every commit. It fails on a broken link, a doc without a pointer line, a
  spec without an index row, a leftover placeholder, an `AGENTS.md` over budget, or a doc
  over 2,000 words.
- When the setup changes (a command, a harness, a rule), update this doc in the same commit.
- When an agent's behaviour must change, edit `agent/<agent>/basic-description.md` and
  regenerate its Role block (`agent/design.md` §3). Never hand-edit a block.
