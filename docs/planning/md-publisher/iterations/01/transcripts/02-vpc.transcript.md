# Workshop 2 — Value Proposition Canvas — transcript

**Facilitator:** Claude (agent, product-owner performer), drafting from `01-bmc.md`'s two accepted
Customer Segments and the repository's stated three build targets (DOCX/PDF/EPUB). No customer
interviews have happened — the methodology's own anti-pattern list names "Imagination-Based
Profiles" as exactly this risk, and it applies here directly; see the open items below.

## Segment coverage

- **Considered, taken:** one VPC file per BMC segment (`02-vpc-docs-as-code-writers.md`,
  `02-vpc-oss-indie-authors.md`), per the methodology's explicit "one file per segment, not one
  file" requirement. Segment names copied verbatim from `01-bmc.md` — no renaming, no merging.
- **Considered, not taken: a third VPC for a hypothetical "enterprise" segment.** Rejected — BMC
  explicitly declined to add an enterprise segment for v1 (see `01-bmc.md`'s transcript), so
  drafting a VPC for a segment BMC didn't name would invent a segment relative to what BMC said,
  which `start-vpc-workshop`'s own facilitate step names as the specific failure to avoid.

## The themes/templates gap (Desired gain, both segments)

- **Considered, taken:** name the gap explicitly in both Value Maps rather than either inventing a
  Gain Creator that doesn't exist in current scope, or silently dropping the Desired gain from the
  Customer Profile. Both VPCs state plainly that v1 has no Gain Creator for "custom
  templates/branding" (docs-as-code) or "built-in themes" (OSS/indie authors).
- **Considered, not taken: quietly omitting the Desired-gain row rather than flagging the gap.**
  Rejected — the VPC methodology's own review checklist ("identify pains/gains with no relief —
  these are feature gaps or conscious deferrals") requires exactly this to be surfaced, not
  smoothed over into an artifact that reads as fully addressed when it isn't.

## New hypotheses opened by this workshop

| ID | Hypothesis | Owning workshop |
| --- | --- | --- |
| H12 | Structural validation-before-generation (H3's differentiator claim) actually addresses the specific named pains above — silent cross-format breakage, broken EPUB links discovered post-publish — with enough severity/frequency that leading with it (rather than "one source, many formats") is the right value-prop framing. Still unvalidated by any interview. | VPC |
| H13 | OSS/indie authors will accept "no themes at v1, plain-but-clean default typography" as meeting their Required gains, without the Desired "built-in themes" gain being necessary to adopt — i.e., v1 doesn't need theming to clear this segment's adoption bar. This is a real scope question, not assumed true. | VPC |
| H14 | Docs-as-code writers' "custom templates/branding per format" (Desired, not Required) can be deferred past v1 without blocking adoption for this segment specifically. | VPC |

H1–H11 (from BMC) are not superseded by this workshop — H3 in particular is directly load-bearing
here (H12 refines it) and stays open. All fourteen hypotheses (H1–H14) carry forward to MVP
Planning (Workshop 8), which must reconcile every one still open against the v1 scope cut.

## Founder decisions, 2026-09-27

1. **Content confirmed** — Jobs/Pains/Gains and both Value Maps stand as drafted.
2. **Theming gap: keep out of v1, track as a concrete backlog item rather than leave as an open
   gap.** Considered and rejected: adding minimal theming to v1 now (would have changed both Value
   Maps and BMC's Key Activities/Cost Structure). Taken instead: both VPCs and `summary.md` now
   name it as a founder-confirmed post-v1 backlog decision, not an ambiguous "gap" or a pure
   hypothesis. H13/H14 were narrowed to match — they no longer ask whether to defer theming (that
   is decided), only whether deferring it costs either segment's adoption once tested with real
   users.
3. Nothing else in H12–H14 was struck or reworded.

## `stop-vpc-workshop` self-review (attempt 1 of the ≤3 cap)

`stop-vpc:evaluate`, run against `value-proposition-canvas.md`'s own anti-pattern checklist, found
`objectiveMet: false` on two checks (both built segments, neither exempt):

1. **Severity and frequency were not populated for any named Pain** in either canvas — only
   qualitative descriptions. Fixed by adding a Severity/Frequency table to every Pain in both
   files, with the highest-priority pain named explicitly per segment.
2. **Jobs/Pains/Gains were not tagged as a founder-delegated assumption** — the transcript said so
   in prose, but the checklist wants the artifact itself traceable, not just the transcript.
   Fixed by adding an explicit "Assumption basis" note at the top of both canvases.

The Fit Verification check (0 orphan pains, 0 orphan gains) passed on the first draft and needed no
fix.

Re-run of `stop-vpc:evaluate` against the revised artifacts: `objectiveMet: true`, no remaining
anti-pattern violations.
