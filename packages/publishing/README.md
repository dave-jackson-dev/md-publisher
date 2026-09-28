# md-publisher-publishing

The Publishing bounded context (see `docs/planning/md-publisher/iterations/01/05-architecture-design.md`):
compiles an already-validated Publication into DOCX, PDF, EPUB, and Web output.

## What's in the folder?

- `src/publication.ts` — loads a directory of `.mdpub` files as one Publication via
  `md-publisher-language`'s workspace services, and surfaces Structure Violations.
- `src/model.ts` — compiles a validated `Document` AST into this package's own
  target-independent intermediate representation (`Chapter`/`ChapterBlock`).
- `src/generators/` — one generator per Build Target (`docx`, `pdf`, `web`, `epub`).
- `src/generate.ts` — runs the requested Build Targets independently (BR-7): a
  `BuildTargetViolation` from one target doesn't stop the others.
- `src/violations.ts` — `BuildTargetViolation`, distinct from a Structure Violation (which is
  Language-context and refuses the whole Generation before this package is ever called).

This package doesn't itself decide what to do with a Structure Violation — that's the CLI's
job (see [packages/cli](../cli/README.md)): check `collectStructureViolations` first and refuse
entirely if any exist, then call `compilePublication` and `generatePublication`.
