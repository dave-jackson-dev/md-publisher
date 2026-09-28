# md-publisher-cli

Validate a `.mdpub` Publication and generate DOCX, PDF, EPUB, and Web output from one source with
one command.

## Install

```bash
npm install -g md-publisher-cli
```

Requires Node.js 20.10.0 or newer.

## Usage

A Publication is a directory of `.mdpub` Documents. Chapter order is filename-alphabetical (e.g.
`01-intro.mdpub`, `02-setup.mdpub`, ...).

```bash
md-publisher-cli generate <publication-dir> --targets docx,pdf,web,epub
```

- `--targets` is a comma-separated list of `docx`, `pdf`, `web`, `epub`. Defaults to all four.
- `.mdpub` supports a practical superset of CommonMark: headings, paragraphs, emphasis/strong,
  code spans, fenced code blocks, blockquotes (nested), lists (ordered/unordered, nested one
  level), images, links, cross-references (`[text](#anchor)`, resolved within the Publication),
  and thematic breaks. See [packages/language](../language/README.md) for exactly what's in and
  out of scope.
- Output is written to `./dist` (relative to the current directory): `dist/<name>.docx`,
  `dist/<name>.pdf`, `dist/<name>.epub`, and `dist/<name>/` for Web. An existing artifact at the
  same path is silently overwritten. The CLI also ensures `./.gitignore` excludes `dist/`
  (creating or appending to it if needed) so a generated artifact is never accidentally committed.
- If the Publication has any unresolved Structure Violation (a broken cross-reference, an
  ambiguous heading anchor, or a heading-level skip), generation is refused entirely — no output
  is produced for any target. Fix the violation and run again.
- EPUB additionally requires one chapter's front matter to declare `toc: true` (its
  table-of-contents source). Without it, EPUB generation alone is skipped with a
  Build-Target Violation; the other requested targets are unaffected.

## What's in the folder?

- [package.json](./package.json) — the CLI package manifest.
- [bin/cli.js](./bin/cli.js) — the executable entry point.
- [src/main.ts](./src/main.ts) — the CLI's command definitions and `generate` action.

Generation itself (compiling a validated Publication into DOCX/PDF/EPUB/Web) lives in
[packages/publishing](../publishing/README.md), the Publishing bounded context this CLI is a thin
wrapper over. Validation is [packages/language](../language/README.md)'s.
