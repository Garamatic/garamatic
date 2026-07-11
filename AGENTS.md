# Garamatic

Meta-repository for the Garamatic microservices ecosystem.
This repo tracks all service repositories as git submodules and provides
a single point of orchestration for local development, integration testing,
and deployment.

## Stack
- **8 microservices** (see `README.md` for full map): garamatic-web, masala-web,
  portal, agentic-service, mailing-service, odoo-integration, ticket-masala,
  monitoring, integration-contracts, integration-tests
- Orchestration: `make setup`, `make up`, `make test`
- CI: GitHub Actions on `dev` (lint), `test`/`acc` (full tests), `main` (deploy)

## Commands
- Start everything: `make up`
- Tests: `make test`
- Integration tests: `make integration-test`
- Full CI: `just ci` (symlinked from dotfiles)

## Deployment (git push to home servers)

Two home Debian servers receive git pushes and auto-deploy:

```bash
git remote add acerpepe acerpepe:~/repos/garamatic.git
git remote add liedelpi liedelpi:~/repos/garamatic.git

# Deploy to one or both:
git push acerpepe main
git push liedelpi main
```

Each server builds and serves the project behind Caddy on a unique port.
Access via Tailscale: `http://acerpepe.bonobo-fort.ts.net:<port>`

## Autonomous session (night-shift loop)

For unsupervised work, follow the night-shift loop at
`$HOME/dotfiles/docs/patterns/agent-night-shift.md`.

**Backlog source:** `TODOS.md`. Find the first unchecked `- [ ]` item,
implement it, mark it `- [x]`, write a worksheet, and commit.

## CI (local only)

CI runs **locally** via `just ci` — no GitHub Actions.

```bash
just ci    # lint → integration tests
```
Pre-commit hooks also gate each commit (see `.pre-commit-config.yaml`).

## Session worksheets & handoff

If a session is interrupted or another agent must continue, write a worksheet
so the next agent picks up without re-reading the full history.

**When to write:** before switching services, at natural breakpoints, at end of
session if work is incomplete.

**Format** — file: `worksheets/YYYY-MM-DD-<topic>.md` (git-committed):

```markdown
# Worksheet: <topic>

## Session
date: YYYY-MM-DD
branch: <branch-name>
services: <which microservices were touched>

## Done
- What was accomplished
- Files changed (paths)

## Decisions
- Key decisions made and why

## Next
- What should happen next
- Any open questions or blockers
```

**Git tagging:** `git tag -a "worksheet-<topic>-$(date +%Y%m%d)" -m "worksheet: <topic>"`

**On session start:** check `worksheets/` for the latest worksheet to find your
starting point.

## Session feedback

After the session, write a feedback entry to `FEEDBACK.md` in the project root
(create it if missing). Append in the format described at
`$HOME/dotfiles/docs/patterns/session-feedback.md`. Committed alongside the
worksheet.

## Doc maintenance (keep docs fresh)

Key docs (`README.md`, per-service `PRODUCT.md`, `DESIGN.md`, `README.md`) must
reflect the current codebase state. Stale docs waste more time than missing
docs.

**When to update docs:**
- After implementing a feature — update any doc describing old behavior
- After a design decision — update relevant service docs
- When you find a doc that's wrong — fix it immediately in the same session

Treat docs as a first-class deliverable. Doc changes belong in the same PR as
code changes.

## Coding conventions

### Per-service conventions vary, but all services share:
- **Formatting:** Prettier (JS/TS), Ruff (Python) — run before commit
- **Pre-commit:** run `pre-commit run --all-files` before pushing
- **Tests:** every service has a test runner; add tests with new code
- **Docker:** every service has a Dockerfile; local dev uses `make up`

### Git
- **Branching:** `dev` → `test`/`acc` → `main` (see README for pipeline)
- Conventional commits: `type(scope): description`
- Always PR — never push directly to `dev`, `test`, or `main`

## Code review

Before merging any PR, **request a code review**.

**Mandatory triggers:**
- After implementing a major feature or complex fix
- Before merging to `dev`, `test`, or `main`
- After refactoring a non-trivial module

**How:** read `~/.agents/skills/requesting-code-review/SKILL.md` and follow its
instructions to dispatch a reviewer subagent with git SHAs and context.

**Act on feedback:** fix Critical/Important issues immediately, note Minor
issues before merge, push back with reasoning if the reviewer is wrong.

## Commit sweep

After a batch of changes, sweep recent commits for patterns, regressions,
and doc drift. Follow `$HOME/dotfiles/docs/patterns/commit-sweep.md`.

```bash
just commit-sweep   # show recent commits + status
```

## End of shift

Before ending any session, run the full validation checklist at
`$HOME/dotfiles/docs/patterns/end-of-shift.md`.

```bash
just eos   # run through all checks
```

## Agent tools (bin/)

Small scripts you build during sessions go in `bin/`. See
`$HOME/dotfiles/docs/patterns/agent-tools.md` for conventions. If a script is
project-generic, put it in `$HOME/dotfiles/scripts/` instead.
