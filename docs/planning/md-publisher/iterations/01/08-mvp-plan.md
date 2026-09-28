# MVP Planning — md-publisher, Iteration 01

**Status: DRAFT — facilitated, not yet founder-accepted (`mvp-planning:accept` is a separate
step).**

Sources: the full accumulated set — `01-bmc.md` (and its Hypothesis Register, H1–H16), both
`02-vpc-*.md`, `03-user-story-map.md`, `05-architecture-design.md`, `07-ux-design.md`. This
workshop has no methodology prompt of its own; its rules are in `start-mvp-planning-workshop`'s
facilitate step and in `stop-mvp-planning-workshop`'s evaluate step.

## Two real findings before any cut is proposed

### Finding 1: a drifted build target — resolved, founder-confirmed 2026-09-27

**BMC's H4 said the three v1 build targets are DOCX, PDF, and EPUB.** The Docs-as-code VPC
(Workshop 2) introduced a fourth — *"one command reliably produces DOCX, PDF, and **web-ready
output**"* — carried unchanged into the Story Map's Docs Writer generation story and Three Amigos'
Feature 5, never reconciled against H4 until this workshop caught it. **Founder decision: Web
stands as a real, intentional fourth v1 build target**, not an oversight to cut. H4 is revised
below to name four targets, not three.

### Finding 2: Sprint 1 alone vs. Sprint 1 + Sprint 2 — resolved, founder-confirmed 2026-09-27

The Story Map already checked that Sprint 1 alone is a coherent, deliverable MVP Slice. Sprint 2
adds live-typing diagnostics and the PR-review-workflow story. **Founder decision: ship the fuller
Sprint 1 + Sprint 2 slice as v1** (10 stories) rather than the thinner Sprint-1-only release.

### Finding 3: full CommonMark grammar support — founder-added 2026-09-28, after Sprint 1 shipped

Not sourced from any of the nine workshops — no VPC pain, Story Map story, or Gherkin Feature
named this. Raised directly by the founder after Sprint 1 (both sub-sprints) had already shipped:
`.mdpub`'s grammar only covers front matter, ATX headings, and same-Publication cross-reference
links (`packages/language/src/md-publisher.langium`, Sprint 1a). Real docs-as-code and indie-author
content routinely needs emphasis, code spans/blocks, lists, blockquotes, images, and general links
— none of which exist yet. **Founder decision: a practical CommonMark superset (not the full
strict spec — no raw HTML block/inline passthrough, no reference-style link definitions, no
precise spec-test-suite conformance target) is promoted into the v1 cut**, sequenced as its own
sprint *before* the Story Map's Sprint 2 (live-typing diagnostics ride on top of this same grammar,
so building them against the current, much narrower grammar would mean redoing that integration).

In scope: emphasis/strong, inline code spans, fenced and indented code blocks, lists (ordered and
unordered, nested, multi-paragraph items), blockquotes (nested), images, general links (as
distinct from the existing same-Publication `CrossReference` construct), thematic breaks, and hard
line breaks (as distinct from the existing soft line break, see the Sprint 1b fix in
`packages/language/src/md-publisher.langium`).

**A real architectural consequence, not a superficial add:** the current grammar is a deliberately
*flat* sequence of elements (see that file's own top comment) — a choice made specifically because
full nested inline Markdown modeling is complex, and Sprint 1a's scope (headings, front matter,
one link form) never needed nesting. Lists containing paragraphs containing emphasis containing
code spans, and arbitrarily nested blockquotes, cannot be represented flat. This sprint replaces
the flat `Document.elements` design with a properly nested block/inline grammar — see
`10-sprint-2-grammar-plan.md` for the task breakdown, including the point estimate (roughly double
Sprint 1's total) and the resulting BR-2 consequence below.

**A real, founder-resolved design tension:** CommonMark's thematic-break syntax (`---`/`***`/`___`
alone on a line, anywhere in the document) collides with the front-matter fence syntax Sprint 1a
built, which was deliberately recognized *anywhere* in the document (not only at the start) so
BR-2 could flag a misplaced front-matter block as a Structure Violation. **Founder decision
2026-09-28: front matter is recognized only at document start**, matching how every other
docs-as-code tool (Jekyll, Hugo, remark-frontmatter) resolves this same ambiguity. Consequence,
stated plainly rather than glossed over: **BR-2 is retired as a meaningful check** — a `---`-fenced
block anywhere other than the very start of a Document is no longer recognized as an attempted
(misplaced) front matter block at all, just a thematic break. BR-1, BR-3, and BR-4 are unaffected.

## Hypothesis Register reconciliation (H1–H16)

| ID | Still testable by a v1 story? | How |
| --- | --- | --- |
| H1 | Yes | Any Docs Writer Sprint 1 story shipping and getting real docs-as-code-writer usage. |
| H2 | Yes | Both segments' stories ship together in Sprint 1 — distinctness is observable once both are in use. |
| H3 | Yes | Features 3/4/8/9 (validation) are the direct test of this differentiator claim. |
| H4 | **Resolved via Finding 1, founder-confirmed 2026-09-27.** Revised: the four v1 build targets are DOCX, PDF, EPUB, and Web (not three) — Web is an intentional target, not scope drift. Testable by Features 5/6 shipping across all four targets. |
| H5 | **Not testable this iteration, by design** — it requires post-launch adoption signal over time, not a story shipping. Not a strand: nothing in v1 was supposed to test it. |
| H6 | Applied as a *cutting criterion* during this workshop (e.g. don't add theming now), not tested by a single story — see "what was cut for this reason" below. |
| H7 | Yes | Feature 1/2 (install via Marketplace/npm) shipping in Sprint 1 and driving real installs. |
| H8 | **Not testable this iteration** — observable only through real GitHub Issues usage after release, not a shippable story. |
| H9 | **Validated through the founder's own build experience**, not a customer-facing story — Sprint 1 Planning (Workshop 9) and actual implementation are where this gets tested. |
| H10 | Same as H9 — validated by implementation experience across Sprint 1's three generators, not a Gherkin scenario. |
| H11 | **Validated through implementation** of Features 5/6 (integrating the actual DOCX/PDF/EPUB libraries), which are in the v1 cut. |
| H12 | Yes | Features 3/4/8/9 directly test this. |
| H13 | Yes | Indie Author's Sprint 1 stories shipping without theming, and real adoption observed. |
| H14 | Yes | Docs Writer's Sprint 1 stories shipping without templates, and real adoption observed. |
| H15 | **Not testable this iteration, by design** — it's about a layer (the hosted service) not in v1 scope at all. Not a strand: nothing in v1 was ever meant to test it. |
| H16 | Yes | Feature 5's regenerate/overwrite scenario shipping and real usage observed. |

**No hypothesis is silently stranded.** H5, H8, H9, H10, H15 are explicitly not testable *by a v1
story* — each has a stated reason (post-launch signal, founder's own build experience, or a future
layer not yet in scope), not a scope cut that dropped a story meant to test it. H4 is the one real
exception — not untestable, but **contradicted** by an unreconciled scope drift, which is Finding 1
above and needs a founder decision, not a testability note.

## v1 cut — founder-confirmed 2026-09-27, amended 2026-09-28 (Finding 3)

**All of Sprint 1 and Sprint 2 from `03-user-story-map.md` (10 of 10 stories), Web included as a
fourth build target alongside DOCX, PDF, and EPUB, plus the CommonMark grammar expansion from
Finding 3.** Sprint 3 stays empty — no stories exist there to cut or defer (already established at
the Story Map workshop).

**Execution sequencing note (not a Story Map edit):** `03-user-story-map.md` itself is an
unmodified historical workshop record — its "Sprint 1"/"Sprint 2"/"Sprint 3" labels stay as
originally written. For *execution* purposes only, Finding 3's grammar work is sequenced between
them: Sprint 1 (shipped) → **Sprint 2 — Grammar Expansion** (Finding 3, new) →
**Sprint 3 — live-typing diagnostics + PR review** (the Story Map's original "Sprint 2", renumbered
for execution only because it now comes third) → the Story Map's "Sprint 3" backlog note (templates/
theming) remains unscheduled, as before.

**Walking Skeleton coherence:** the proposed cut is a real, usable end-to-end path — install →
write with build-time and live validation → generate multi-format output that opens/renders
cleanly → review a PR without wading through build artifacts. Not a set of individually-justified
stories with no coherent whole. Finding 3's grammar expansion strengthens this path (real documents
use more than headings and plain paragraphs) without changing its shape.
