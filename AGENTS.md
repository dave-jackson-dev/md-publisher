# Agent guide — md-publisher

This file is the primary orientation document for any AI coding agent working in this
repository (Claude, Codex, Cursor, etc.). Tool-specific files (e.g. `CLAUDE.md`) are thin
pointers into this file — put substantive guidance here, not there.

## What this repository actually is

Two independent things are layered on top of each other here, and it's easy to conflate them:

1. **A Langium-based DSL and toolchain named `md-publisher`**, for docs-as-code writers and indie
   technical authors who publish the same `.mdpub` source to multiple targets (DOCX, PDF, EPUB,
   Web). Iteration 01's MVP Workshops (`docs/planning/md-publisher/iterations/01/`) settled the
   product decisions; Sprint 1a and 1b implemented them — see
   [Current state](#current-state-sprint-1-implemented) below for what's real.
2. **An MVP-tracked workspace.** `.mvp/project.json` marks this directory as a project known to
   the external `mvp` CLI (installed on this machine via asdf, not a dependency of this repo — see
   [The `mvp` CLI](#the-mvp-cli)). That tool is shared governance tooling used across this user's
   projects (e.g. the sibling `singularity` repo); it is not part of `md-publisher`'s own build.

Don't assume either one implies the other: the Nx/npm workspace would build and test fine with
`.mvp/` deleted, and the `mvp` tool's governance model doesn't care what's inside `packages/`.

## Repository layout

```
package.json            npm workspaces root; orchestrates the four packages below
nx.json                  Nx config — currently just { "analytics": false }, no custom targets
tsconfig.json            base TS compiler options, shared via project references
tsconfig.build.json      TS project-reference graph used by `npm run build`
.mvp/project.json        MVP workspace marker (see "The mvp CLI")
.tool-versions            asdf pin: nodejs 24.19.0
docs/planning/md-publisher/iterations/01/  Iteration 01's MVP Workshop outputs (BMC, VPC, story
                          map, domain storytelling with BR-1..BR-9, architecture design, Gherkin
                          features, UX design, MVP plan, Sprint 1 plan) — read `summary.md` first
examples/user-guide/     a real 3-chapter Publication with its actual generated DOCX/PDF/EPUB/Web
                          output checked in under dist/ — reproduce it, or read it to see the
                          pipeline's real behavior instead of trusting a description of it

packages/
  language/              the Language bounded context (grammar + Structure Violation validation)
    src/md-publisher.langium       real .mdpub grammar: front matter, headings, cross-references
    src/generated/                AST/grammar/module — generated, do not hand-edit
    src/md-publisher-module.ts    DI module for the language services
    src/md-publisher-validator.ts BR-1..BR-4 Structure Violation checks
    src/md-publisher-util.ts      parseHeading/parseCrossReference/slugify, reused by publishing
    test/                         Vitest specs: parsing, linking (cross-document), validating
  publishing/            the Publishing bounded context — compiles a validated Publication into
                          DOCX/PDF/EPUB/Web output. Architecture Design recommended extracting this
                          into its own package rather than leaving it inside packages/cli; Sprint 1b
                          did that extraction (T4)
    src/publication.ts    loads a directory of .mdpub files as one Publication, surfaces violations
    src/model.ts           Document AST -> this package's own Chapter/ChapterBlock IR
    src/generators/         one generator per Build Target (docx, pdf, web, epub)
    src/generate.ts         runs targets independently (BR-7); BuildTargetViolation (BR-6) is per-target
  cli/                     `md-publisher-cli` — thin commander wrapper: validate, refuse-or-generate
    src/main.ts             the `generate <publication-dir> --targets ...` command
    bin/cli.js             entry point (`node ./bin/cli`)
  extension/                `vscode-md-publisher` — VS Code extension (LSP client + syntax)
    src/language/main.ts   language server entry point
    src/extension/main.ts  extension activation
```

Each package has its own README with more detail
([language](./packages/language/README.md), [publishing](./packages/publishing/README.md),
[cli](./packages/cli/README.md), [extension](./packages/extension/README.md)). Read those before
touching a package you haven't worked in yet.

## Toolchain and commands

- Node is pinned to **24.19.0** via `.tool-versions` (asdf). Use that Node version.
- Package manager is **npm** (npm workspaces), not pnpm/yarn — the lockfile is `package-lock.json`.
- `npm install` at the root installs all four packages.
- `npm run langium:generate` — regenerate `src/generated/*` after editing the `.langium` grammar.
  Do this before typechecking/building if you've touched the grammar; generated files are gitignored
  equivalents (`**/src/generated` is excluded — see `.gitignore`) and are not committed.
- `npm run build` — `tsc -b tsconfig.build.json` across all project references, then
  `npm run build --workspaces` (which also runs the extension's esbuild bundling step).
- `npm run watch` — incremental `tsc -b --watch` for the whole graph.
- `npm test` — runs `packages/language`'s and `packages/publishing`'s Vitest suites. `cli` and
  `extension` have no test scripts defined yet; don't assume `npm test` covers them.
- Manual end-to-end check: `node packages/cli/bin/cli.js generate <publication-dir> --targets
  docx,pdf,web,epub` against a directory of `.mdpub` files, then inspect `./dist`.
- VS Code extension debugging: open this folder in VS Code and press F5 (`.vscode/launch.json`
  launches an Extension Development Host); `.vscode/tasks.json` wires `Ctrl+Shift+B` to
  `langium:generate && build`.

### Nx

Nx (23.2.1) is installed and `.nx/` cache data exists, but `nx.json` has no `targetDefaults` or
plugin configuration beyond the default — Nx is inferring projects and targets purely from
`package.json` scripts across the npm workspaces. There are no hand-authored `project.json` files
for `language`/`cli`/`extension`; Nx's inferred target names match the npm script names 1:1
(e.g. `nx run md-publisher-language:test`).

**Known quirk:** Nx's default project discovery globs for any `project.json` in the workspace,
so it also picks up `.mvp/project.json` (an unrelated marker file, not an Nx config) as a fourth,
empty project node named `.mvp` with no targets. This is harmless — it just means `.mvp` shows up
in `nx show projects` / the project graph — but it isn't a real Nx project and shouldn't be treated
as one. If this becomes noisy, exclude `.mvp` via `nx.json`'s workspace globs rather than moving or
renaming the marker file (the `mvp` tool expects it at that exact path).

For general Nx workflow questions, prefer the `nx-workspace` and `nx-generate` skills / the Nx MCP
server if available in your session before guessing flags — this repo doesn't have bespoke Nx
conventions beyond the quirk above.

## Current state: Sprint 1 implemented

Iteration 01's MVP Workshops (all nine, merged to `dev` via PR #10/#11) settled the product
decisions — see `docs/planning/md-publisher/iterations/01/summary.md` for the fast version, or the
full docs for detail (BR-1..BR-9, the Gherkin Features, the Sprint 1a/1b split). Both sub-sprints
are now implemented:

- **Sprint 1a — Validate** (`packages/language`): a real `.mdpub` grammar (front matter, ATX
  headings, cross-reference links `[text](#anchor)`), and Structure Violation checks for BR-1
  (dangling cross-reference), BR-4 (ambiguous anchor, resolved Publication-wide), BR-2 (front
  matter must precede content), and BR-3 (no heading-level skips).
- **Sprint 1b — Generate** (`packages/publishing`, `packages/cli`): `packages/publishing` compiles
  a validated Publication (a directory of `.mdpub` files, chapter order = filename-alphabetical —
  an assumption, not a sourced requirement, since no manifest/ordering format is specified anywhere
  in the workshop docs) into DOCX, PDF, Web, and EPUB output. EPUB requires one chapter's front
  matter to declare `toc: true` (BR-6's table-of-contents source; also an assumption filling a
  documented gap — see the Sprint 1b PR description for the reasoning) or that one target is
  refused with a `BuildTargetViolation`, independent of the others (BR-7). The CLI
  (`md-publisher-cli generate <publication-dir> --targets ...`) refuses the whole Generation up
  front if the Publication has any unresolved Structure Violation (BR-5's silent-overwrite applies
  otherwise — no `--force` flag, no confirmation prompt, by design).

Still open / out of scope for Iteration 01: theming/templates (explicitly deferred), the hosted
build service and other paid layers (open-core, not built in v1), RBAC/Zero-Trust (H15, no server
in v1), and Sprint 2's three stories (live-typing diagnostics, PR-review workflow — VS Code
diagnostics themselves are Sprint 1a's `md-publisher-validator.ts` and already live; Sprint 2 is
about the surrounding workflow, not first implementing diagnostics).

If asked to implement a feature beyond what's described above or in the workshop docs, check with
the user about intent before inventing new DSL/product semantics.

## The `mvp` CLI

`mvp` (resolved via asdf shim, `~/.asdf/shims/mvp`) is Lean-Agile MVP governance tooling shared
across this user's projects — it is not a dependency declared anywhere in this repo's
`package.json`. Run `mvp --help` for the full, current operation catalog; don't hardcode command
names from memory since the catalog evolves. Broad shape of what it covers:

- **Workspace marking**: `mvp.workspace.init` / `mvp.workspace.status` — what `.mvp/project.json`
  is for.
- **Documentation corpus**: `mvp.documentation.ingest` / `mvp.documentation.search` /
  `mvp.documentation.compact` — a searchable store of this project's docs, separate from grepping
  files by hand.
- **Defect tracking**: `defect.*` — open/claim/hypothesise/resolve, following a specific
  root-cause-analysis discipline (see `mvp help defect.open` etc. for the rules cited in each
  operation's summary).
- **ADRs and SCM workflow**: `mvp.adr.create`, `scm.adr.*`, `scm.branch.*`, `scm.phase.*`,
  `scm.feature.close`, `scm.promotion.*`, `scm.cascade.*` — a structured branch/promotion ladder
  layered on top of git, with its own register and cascade rules.
- **Agent personas**: `agent.persona.*`, `agent.dispatch` — pinned, versioned prompts run against
  pinned models.
- **Skills**: `skill.*` — a dependency graph of workflow "skills" with steps that can be pushed,
  started, blocked, and popped; distinct from Claude Code's own `.claude/skills/`.

Modes: `--repl` (interactive), `--sidecar` (newline-delimited JSON protocol), `--cli` (one
operation then exit — used for all the examples above). Use `mvp help <operation>` for per-operation
detail; every operation has a JSON schema you can inspect that way rather than guessing flags.

## Where to look next

- Package-level READMEs (linked above) for generated-file inventories.
- [Langium docs](https://langium.org/docs/learn/workflow/write_grammar/) for grammar-authoring
  workflow once real DSL semantics are being designed.
- `README.md` for the human-facing project summary.
