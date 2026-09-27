# Claude Code — md-publisher

Claude is one of several agents that may work in this repository. The substantive guidance lives
in [AGENTS.md](./AGENTS.md) — read it first. This file only carries pointers and Claude-specific
tool configuration; do not add project or workflow guidance here.

- Repo overview, package layout, scaffold state → [AGENTS.md](./AGENTS.md#repository-layout),
  [AGENTS.md](./AGENTS.md#current-state-this-is-a-fresh-scaffold)
- Build/test/watch commands → [AGENTS.md](./AGENTS.md#toolchain-and-commands)
- Nx setup and the `.mvp` project-graph quirk → [AGENTS.md](./AGENTS.md#nx)
- The external `mvp` governance CLI → [AGENTS.md](./AGENTS.md#the-mvp-cli)
- Git status (not yet initialized) → [AGENTS.md](./AGENTS.md#not-a-git-repository-yet)

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax


<!-- nx configuration end-->