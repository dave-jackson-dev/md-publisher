# md-publisher

A Markdown-based format (`.mdpub`) and toolchain for docs-as-code technical writers and indie
authors who publish the same source to multiple targets — DOCX, PDF, EPUB, and Web — from one
command, with broken cross-references and structural mistakes caught at build time (and live in
the editor) instead of in a shipped artifact.

An Nx-managed npm-workspaces monorepo, originally scaffolded with the
[Langium](https://langium.org) Yeoman generator. Iteration 01's MVP Workshops
(`docs/planning/md-publisher/iterations/01/`) settled the product decisions; Sprint 1a and 1b
implemented them. See [AGENTS.md](./AGENTS.md#current-state-sprint-1-implemented) for exactly
what's real versus still planned.

This directory is also marked as a project for a separate, external governance tool (`mvp`) used
across this user's projects. That tool is not part of this repo's build — see
[AGENTS.md](./AGENTS.md#the-mvp-cli) for details.

## Packages

- [packages/language](./packages/language/README.md) — the Language bounded context: the
  `.mdpub` grammar, and Structure Violation validation (broken cross-references, ambiguous
  anchors, misplaced front matter, heading-level skips).
- [packages/publishing](./packages/publishing/README.md) — the Publishing bounded context:
  compiles a validated Publication into DOCX, PDF, EPUB, and Web output.
- [packages/cli](./packages/cli/README.md) — `md-publisher-cli`, the `generate` command over a
  Publication directory.
- [packages/extension](./packages/extension/README.md) — `vscode-md-publisher`, a VS Code
  extension providing syntax highlighting and live Structure Violation diagnostics for `.mdpub`
  files.

## Getting started

Requires Node **24.19.0** (pinned in `.tool-versions` via asdf) and npm.

```bash
npm install
npm run langium:generate   # generate AST/grammar/module from the .langium grammar
npm run build               # tsc project-reference build + package build scripts
npm test                    # runs packages/language's and packages/publishing's Vitest suites
```

Try the CLI against a directory of `.mdpub` files:

```bash
node packages/cli/bin/cli.js generate <publication-dir> --targets docx,pdf,web,epub
```

**[examples/](./examples/)** has a real three-chapter Publication with its actual generated DOCX,
PDF, EPUB, and Web output checked in — open them directly to see what `generate` produces, or
follow the example's README to reproduce them yourself and to see a Structure Violation refuse a
build.

To try the VS Code extension: open this folder in VS Code and press `F5` to launch an Extension
Development Host, then open a `.mdpub` file.

## Root-level files

- [package.json](./package.json) — the npm workspaces root manifest and build/test scripts.
- [tsconfig.json](./tsconfig.json) — the base TypeScript compiler configuration.
- [tsconfig.build.json](./tsconfig.build.json) — the TypeScript project-reference graph used by
  `npm run build`.
- [nx.json](./nx.json) — Nx configuration (currently minimal; Nx infers projects/targets from the
  npm workspace package.json scripts).
- [LICENSE](./LICENSE) — MIT.

## Working with AI agents in this repo

See [AGENTS.md](./AGENTS.md) — it's the source of truth for agent-facing conventions, the current
implementation state, and the `mvp` tooling. `CLAUDE.md` only points into it.
