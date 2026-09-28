# Sprint 2 Planning — Grammar Expansion, md-publisher, Iteration 01

**Status: DRAFT — facilitated, not yet founder-accepted (`sprint-planning:accept` is a separate
step).**

Sources: `08-mvp-plan.md`'s Finding 3 (the founder-added CommonMark requirement, added
2026-09-28 after Sprint 1 shipped) and the actual current state of `packages/language` and
`packages/publishing` (Sprint 1a/1b's real implementation, not a description of it). **Not sourced
from any of the nine original workshops** — no VPC pain, Story Map story, or Gherkin Feature named
this; see Finding 3 for why it's in v1 anyway.

Per `08-mvp-plan.md`'s execution-sequencing note, this is called **Sprint 2** for execution
purposes — inserted before the Story Map's own "Sprint 2" (live-typing diagnostics + PR review,
now executed third and referred to as Sprint 3). `03-user-story-map.md` itself is unmodified.

## Greenfield verification (performed, not assumed)

Checked the actual repository state directly:

- `packages/language/src/md-publisher.langium` covers exactly three constructs: front matter,
  ATX headings, and one link form (`[text](#anchor)`, same-Publication anchors only). No emphasis,
  code spans/blocks, lists, blockquotes, images, general links, or thematic breaks exist.
- The AST is a **flat** sequence (`Document.elements: (FrontMatter|Heading|CrossReference|
  ParagraphBreak|PlainRun)[]`) — confirmed by reading the grammar file's own design comment, not
  inferred. This is the real starting point for T27 below, not a simplification to preserve.
- `packages/publishing/src/model.ts` compiles that flat AST into an equally flat
  `Chapter.blocks: (ChapterHeadingBlock|ChapterParagraphBlock)[]` IR. All four generators
  (`generators/{docx,pdf,web,epub}-generator.ts`) only know how to render those two block types.

**Confirmed genuinely additive, not a migration.** Nothing existing needs to keep working
byte-for-byte — BR-2's behavior is a deliberate, founder-confirmed change (see Finding 3), not
something this sprint needs to preserve.

## Scope: a practical CommonMark superset, not the full spec

Founder-confirmed 2026-09-28. **In scope:** emphasis/strong, inline code spans, fenced and
indented code blocks, lists (ordered/unordered, nested, multi-paragraph items), blockquotes
(nested), images, general links (distinct from the existing same-Publication `CrossReference`),
thematic breaks, and hard line breaks. **Explicitly out of scope:** raw HTML blocks/inline
passthrough, reference-style link definitions (`[text][ref]` + a separate `[ref]: url` line),
precise CommonMark spec-test-suite conformance, and GFM tables (a real, common extension, but not
requested — raise separately if wanted).

## Task breakdown, dependency-ordered, split across two sub-sprints

Same rationale as Sprint 1's 1a/1b split (`09-sprint-1-plan.md`): parsing needs no generator to be
correct, so Language-context work is its own sub-sprint before any Publishing-context rendering
work begins. Points are Fibonacci-ish (1/2/3/5/8), specification-complexity estimates, not raw
code-size estimates.

### Sprint 2a — "Parse" (46 points)

Ships: a properly nested `.mdpub` grammar covering the full practical-superset construct list, and
Structure Violation validation (BR-1/BR-3/BR-4) re-verified against nested content. No rendering
changes — DOCX/PDF/EPUB/Web still only render headings and plain paragraphs until 2b.

| Task | Bounded context | Notes | Points |
| --- | --- | --- | --- |
| T27: Redesign the grammar from a flat element sequence to a nested block/inline structure | Language | Foundational — every other task in this sprint depends on it | 8 |
| T28: Restrict front matter to document start; recognize thematic breaks (`---`/`***`/`___`) elsewhere | Language | Resolves Finding 3's `---` ambiguity; retires BR-2 (founder-confirmed) | 3 |
| T29: Fenced code blocks (with optional language info string) and indented code blocks | Language | Verbatim content — no inline parsing inside | 5 |
| T30: Lists — unordered/ordered, nesting, multi-paragraph items, lazy continuation | Language | CommonMark's hardest single construct — continuation-line rules are genuinely subtle | 8 |
| T31: Blockquotes, including nesting | Language | | 5 |
| T32: Inline emphasis and strong | Language | CommonMark's delimiter-run/flanking-rule handling, not a naive `*...*` regex | 5 |
| T33: Inline code spans | Language | | 2 |
| T34: General links and images, distinct from the existing `CrossReference` | Language | A `#anchor` target is a CrossReference; anything else is a generic Link/Image | 3 |
| T35: Hard line breaks, distinct from the existing soft break | Language | Trailing 2+ spaces, or a trailing backslash, before a line break | 2 |
| T36: Re-verify BR-1/BR-3/BR-4 against the nested AST; update `md-publisher-validator.ts` | Language | Headings/cross-references can now live inside list items and blockquotes | 5 |

### Sprint 2b — "Render" (39 points)

Ships: all four generators rendering the full construct set. Depends on 2a's nested AST being
final — `packages/publishing`'s IR redesign (T37) can't start against a moving grammar.

| Task | Bounded context | Notes | Points |
| --- | --- | --- | --- |
| T37: Redesign `packages/publishing`'s IR (`Chapter`/`ChapterBlock`) for the nested AST | Publishing | Blocks T39–T42 | 5 |
| T38: Image asset handling — resolve a Publication-relative path once, embed per target | Publishing | Cross-cutting; T39–T42 depend on this rather than each reinventing it | 5 |
| T39: DOCX generator — lists, blockquotes, code blocks, bold/italic, images | Publishing | Native Word list numbering, not manual bullet characters | 8 |
| T40: EPUB generator — same, as semantic (X)HTML | Publishing | `<ul>/<ol>`, `<blockquote>`, `<pre><code>`, `<em>/<strong>`, `<img>` | 8 |
| T41: Web generator — same, as plain HTML | Publishing | | 5 |
| T42: PDF generator — same, via pdfkit's manual layout model | Publishing | The most involved of the four — no native list/blockquote primitives to lean on | 8 |

**Total: 85 points across both, 46 + 39.**

## Risk: this is nearly double Sprint 1's entire size

Sprint 1 (44 points total, both sub-sprints) was already the founder's largest single build, with
H9/H10 (solo-maintainer time and four-generator maintenance sustainability) still unvalidated per
`08-mvp-plan.md`'s hypothesis reconciliation. This sprint is **85 points — roughly double that** —
on the same unvalidated velocity. Stated plainly rather than downplayed: this is a real
sustainability question the founder should weigh explicitly (e.g. splitting 2a and 2b into
separately-shippable sub-releases, or reconsidering the practical-superset scope itself), not an
estimate to accept quietly because Sprint 1 happened to land smoothly.

## Sprint Goals

> **Sprint 2a:** By the end of Sprint 2a, `.mdpub` parses and validates the full practical
> CommonMark superset — emphasis, code spans/blocks, lists, blockquotes, images, general links,
> thematic breaks, and hard breaks — with Structure Violation checks intact against nested
> content. No generator changes yet; DOCX/PDF/EPUB/Web output is unchanged from Sprint 1b.

> **Sprint 2b:** By the end of Sprint 2b, all four Build Targets render every construct in the
> practical superset, not just headings and plain paragraphs — verified the same way Sprint 1b
> was, by inspecting real generated output (see `examples/user-guide/`), not only unit tests.

## Feature branches (for when Sprint 2 execution begins — not created by this workshop)

Per the methodology's one-branch-per-story convention, Golden-Thread-named:

`story/commonmark-grammar` (Sprint 2a), `story/commonmark-rendering` (Sprint 2b). Proposed names
for Sprint 2 execution's own future branches — this workshop is planning, not implementation, and
creates neither of them.
