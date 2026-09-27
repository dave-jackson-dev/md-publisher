# md-publisher

An Nx-managed npm-workspaces monorepo scaffolded with the [Langium](https://langium.org) Yeoman
generator for a DSL named `md-publisher` (file extension `.mdpub`). It is currently at the
**generator-scaffold stage**: the workspace builds and tests, but the grammar, validator, and code
generator are all still the Langium generator's placeholder examples — no `md-publisher`-specific
language semantics have been designed or implemented yet.

This directory is also marked as a project for a separate, external governance tool (`mvp`) used
across this user's projects. That tool is not part of this repo's build — see
[AGENTS.md](./AGENTS.md#the-mvp-cli) for details.

## Packages

- [packages/language](./packages/language/README.md) — the grammar package (always present in a
  Langium project): the `.langium` grammar source, generated AST, DI module, and validator.
- [packages/cli](./packages/cli/README.md) — `md-publisher-cli`, a commander-based CLI that runs
  the generator over `.mdpub` files.
- [packages/extension](./packages/extension/langium-quickstart.md) — `vscode-md-publisher`, a VS
  Code extension providing syntax highlighting and language-server support for `.mdpub` files.

## Getting started

Requires Node **24.19.0** (pinned in `.tool-versions` via asdf) and npm.

```bash
npm install
npm run langium:generate   # generate AST/grammar/module from the .langium grammar
npm run build               # tsc project-reference build + package build scripts
npm test                    # runs packages/language's Vitest suite (only package with tests)
```

To try the VS Code extension: open this folder in VS Code and press `F5` to launch an Extension
Development Host, then open a `.mdpub` file.

## Root-level files

- [package.json](./package.json) — the npm workspaces root manifest and build/test scripts.
- [tsconfig.json](./tsconfig.json) — the base TypeScript compiler configuration.
- [tsconfig.build.json](./tsconfig.build.json) — the TypeScript project-reference graph used by
  `npm run build`.
- [nx.json](./nx.json) — Nx configuration (currently minimal; Nx infers projects/targets from the
  npm workspace package.json scripts).
- [.gitignore](./.gitignore) — files ignored by git (note: this directory is not yet a git
  repository).

## Working with AI agents in this repo

See [AGENTS.md](./AGENTS.md) — it's the source of truth for agent-facing conventions, the current
scaffold state, and the `mvp` tooling. `CLAUDE.md` only points into it.
