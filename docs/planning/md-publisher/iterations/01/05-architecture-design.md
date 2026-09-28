# Architecture Design — md-publisher, Iteration 01

**Status: DRAFT — facilitated, not yet founder-accepted (`architecture-design:accept` is a
separate step).**

Source: `04-domain-storytelling.md`. Every bounded context, aggregate, and dependency-map entry
below traces to a specific domain story — no invented boundaries.

**Cross-project consequence check (performed, not skipped): none.** Nothing below reuses,
migrates, or depends on code from `lean-agile-os`, `singularity`, or any other existing project.
Every dependency named is a fresh, external, per-format library (already named as Key Partners in
`01-bmc.md`) or code within this repository.

## Bounded contexts and aggregates

| Domain Story | Bounded Context | Aggregate / Root | Reasoning |
| --- | --- | --- | --- |
| Story 1 — Write & Validate | **Language** | `Publication` (root), containing `Document` entities | A `Document`'s validity (cross-references, front matter, heading order) only makes sense relative to its `Publication` — a cross-reference resolves against sibling Documents in the same Publication, so `Document` is not its own aggregate root. |
| Story 2 — Generate Output | **Publishing** | No aggregate root — `Generator` is a **domain service**, `OutputArtifact` a value it produces | An `OutputArtifact` has no internal lifecycle/invariant worth protecting behind an aggregate boundary (it's a derived output, always reproducible from its source `Publication`, per BR-5's silent-overwrite rule) — forcing an aggregate here would be modeling a boundary that doesn't exist. |
| Story 3 — Review & Ship | *(none — see below)* | *(none)* | `PullRequest`, `Reviewer`, and `ContinuousIntegration` are **external** to md-publisher's domain — owned by the git-hosting platform and CI runner, not modeled here. Story 3 doesn't introduce a new bounded context; it's an *invocation context* for the Publishing context's existing `Generator` service (BR-9: "Generation and validation work identically... in CI"). Naming a "Review" bounded context with no real aggregate behind it would be the Invented Aggregates anti-pattern. |

This maps directly onto the existing package split: **Language** ↔ `packages/language` (already
correctly separated in the scaffold). **Publishing** currently has **no dedicated package** — its
logic lives as a placeholder inside `packages/cli/src/generator.ts`. See the architecture
recommendation below.

## Dependency Rule check

- **Language context:** `GrammarEngine` is pure parsing/validation logic with no outward
  dependency on infrastructure — file I/O (reading a `.mdpub` file from disk) is correctly kept
  outside the domain layer in the existing scaffold (`NodeFileSystem` is injected in
  `packages/cli/src/main.ts`, not imported inside the grammar/validator). **No violation found.**
- **Publishing context:** `Generator` *does* need outward dependencies — a DOCX-writing library, a
  PDF-rendering engine, an EPUB-packaging library (BMC's three Key Partners). Per the Dependency
  Rule, the domain layer must depend on an **abstraction** (a port — e.g. `DocxWriterPort`,
  `PdfRendererPort`, `EpubPackerPort`), with each actual third-party library as an **adapter**
  implementing that port, not imported directly into domain logic. **No violation yet, because no
  Publishing code exists — this is a constraint for implementation, not a finding against existing
  code.**

## 🔴 Architecture recommendation: Publishing needs its own package

**Not yet built, so not yet a violation — but worth deciding now rather than at implementation
time.** `packages/cli` currently owns the only generator code (a placeholder). Once the VS Code
extension (`packages/extension`) also needs to invoke generation directly — not just parse/validate
— it would either import from `packages/cli` (wrong direction; an extension importing a CLI is
backwards) or duplicate generation logic. **Recommendation: extract a `packages/publishing`
library** that both `packages/cli` and `packages/extension` depend on, mirroring how both already
depend on `packages/language`. This is an architecture judgment call made without live
implementation experience yet — flagged as such, not asserted as settled fact.

## Inter-story dependency map

| Must land first | Before | Because |
| --- | --- | --- |
| Story 1 — Write & Validate | Story 2 — Generate Output | Generation's own business rule (BR-6: "if the Publication has an unresolved Structure Violation, the Generator refuses to produce any Output Artifact") requires the Language context's validation to exist first — `Generator` consumes a validated `Publication`, which only exists once Story 1's `GrammarEngine`/`StructureViolation` logic is built. |
| Story 2 — Generate Output | Story 3 — Review & Ship | Story 3's CI-based rule (BR-9: generation runs identically in CI) requires something for CI to invoke — the "PR marked Failing" behavior can't be built before `Generator` exists to fail. |

**No internal ordering within Story 2:** per BR-7 ("Build Targets are independent of each other and
may be generated in any order or subset"), the DOCX, PDF, and EPUB generators have no dependency on
each other and may be built in any order — stated explicitly rather than left for Sprint Planning
to rediscover.

## Cross-check against Story Map release slicing

**No conflict found.** Story 1's Sprint 1 stories (build-time validation) already precede Story 2's
Sprint 1 stories (generation) in the Story Map's own ordering — the dependency map's Story 1-before-
Story 2 constraint is satisfied by where the Story Map already put them. Story 2's Sprint 1 stories
precede Story 3's Sprint 2 story (PR review) — also satisfied. The Story Map's release slicing and
this workshop's dependency map agree; nothing needs to move.

## New hypothesis opened by this workshop

None — this workshop's outputs (bounded contexts, the Dependency Rule application, the dependency
map) are architecture judgment calls grounded directly in Domain Storytelling's frozen vocabulary
and business rules, not unvalidated claims about customers or markets. The `packages/publishing`
recommendation is flagged as a call made without implementation experience, but it's a technical
design decision the team can revise on contact with code — not a hypothesis requiring a customer
interview to validate.
