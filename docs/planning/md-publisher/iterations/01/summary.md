# MVP Iteration 01 — md-publisher — running summary

## Workshop 1 — Business Model Canvas

**Status: complete**, accepted 2026-09-27. See [`01-bmc.md`](./01-bmc.md) and its transcript
[`transcripts/01-bmc.transcript.md`](./transcripts/01-bmc.transcript.md).

- `stop-bmc:evaluate` findings: one anti-pattern violation on first pass — the Hypothesis Register
  didn't cover all nine BMC blocks (Channels, Customer Relationships, Key Resources, Key Activities,
  Key Partners had none). Fixed in the same attempt by adding H7–H11; re-evaluated clean.
  `objectiveMet: true` on the corrected artifact.
- Two blocks needed founder direction beyond the initial draft: **Customer Segments** were
  confirmed as drafted (docs-as-code technical writers; OSS/indie technical authors). **Revenue
  Streams** was revised from "adoption-only, no revenue plan" to an explicit open-core plan —
  free v1 core, three future paid layers (hosted build/publish service, Pro features, Enterprise/
  team support) — planned now so v1 scope can weight capabilities that extend toward one of the
  three.
- `stop-bmc:propagate`: searched the documentation store for "md-publisher" — zero hits, and
  confirmed against disk (this is the project's first iteration; nothing pre-existing to
  invalidate). Nothing propagated.
- Eleven Hypothesis Register entries (H1–H11) are open, unvalidated by any customer interview, and
  carry forward to MVP Planning (Workshop 8), which must reconcile every one still open against the
  v1 scope cut.

## Workshop 2 — Value Proposition Canvas

**Status: complete**, accepted 2026-09-27. Two canvases (one per BMC Customer Segment), per
[`02-vpc-docs-as-code-writers.md`](./02-vpc-docs-as-code-writers.md) and
[`02-vpc-oss-indie-authors.md`](./02-vpc-oss-indie-authors.md), transcript at
[`transcripts/02-vpc.transcript.md`](./transcripts/02-vpc.transcript.md).

- `stop-vpc:evaluate` findings: Fit Verification (0 orphan pains, 0 orphan gains) passed on first
  draft. Two other checks failed and were fixed same-attempt: Severity/Frequency wasn't populated
  for any Pain (added, with the highest-priority pain named per segment), and the Customer Profiles
  weren't tagged as founder-delegated assumptions on the artifact itself (added an Assumption basis
  note to both). `objectiveMet: true` on the corrected artifacts. No segment-confusion signal
  found.
- **Backlog item (founder-confirmed 2026-09-27): templates/theming for DOCX/PDF/EPUB output is out
  of v1 scope**, tracked here rather than left as an ambiguous gap. Both segments' v1 experience
  ships with plain-but-clean default typography only. H13/H14 narrowed accordingly — no longer
  "should we defer," only "does deferring cost us adoption once tested."
- Three new Hypothesis Register entries opened (H12–H14, appended to `01-bmc.md`'s register, not
  duplicated here). All fourteen (H1–H14) carry forward to MVP Planning.

## Workshop 3 — User Story Map

**Status: complete**, accepted 2026-09-27. See
[`03-user-story-map.md`](./03-user-story-map.md), transcript at
[`transcripts/03-story-map.transcript.md`](./transcripts/03-story-map.transcript.md).

- 4 Activities, a walking skeleton, and 7 Sprint 1/2 stories, every one traced to a named VPC entry
  (no floating stories). Sprint 3 deliberately empty — no Desired/Unexpected-tier VPC entry to
  source a story from beyond the already-decided theming backlog item.
- `stop-story-map:evaluate` findings: traceability and Sprint-1 coherence both passed cleanly. One
  judgment call, founder-confirmed rather than decided unilaterally: **zero "I CANNOT" Zero Trust
  boundary stories exist**, treated as a documented exception (not a silent gap, not fabricated
  stories for a boundary v1's architecture doesn't have) — tracked as H15, since v1 is a
  single-user local tool with no runtime RBAC boundary to enforce.
- New hypothesis: H15, appended to `01-bmc.md`'s register. All fifteen (H1–H15) carry forward to
  MVP Planning.

## Workshop 4 — Domain Storytelling

**Status: complete**, accepted 2026-09-27. See
[`04-domain-storytelling.md`](./04-domain-storytelling.md), transcript at
[`transcripts/04-domain-storytelling.transcript.md`](./transcripts/04-domain-storytelling.transcript.md).

- 3 domain stories (Write & Validate, Generate Output, Review & Ship) with 9 recorded business
  rules and Mermaid diagrams (reasoned choice over a dedicated canvas, stated explicitly). Get
  Started (install) excluded — no business-rule content, a documented low-stakes exception.
- **No real domain expert was interviewed** — the workshop's own biggest departure from how it's
  meant to run, flagged prominently in the artifact rather than glossed over.
- One founder decision: BR-5 confirmed as silent-overwrite-on-generate (no warn/force-flag), a
  product call with no upstream basis, recorded honestly as such.
- New hypothesis: H16 (does silent overwrite hold up once tested). All sixteen (H1–H16) carry
  forward to MVP Planning.

## Workshop 5 — Architecture Design

**Status: complete**, accepted 2026-09-27. See
[`05-architecture-design.md`](./05-architecture-design.md), transcript at
[`transcripts/05-architecture-design.transcript.md`](./transcripts/05-architecture-design.transcript.md).

- Two bounded contexts (Language ↔ `packages/language`; Publishing, not yet its own package).
  Story 3 (Review & Ship) intentionally has no bounded context — its actors are external to
  md-publisher's domain (git-hosting platform, CI runner).
- Dependency Rule holds for both contexts; Publishing will need ports/adapters for the three
  format libraries once built.
- **Architecture recommendation, not yet acted on:** extract a `packages/publishing` library so
  both `cli` and `extension` can depend on it, rather than the extension importing from the CLI.
- Two-row dependency map (Write & Validate → Generate Output → Review & Ship); cross-checked
  against the Story Map's release order — no conflicts found.
- No new hypothesis — this workshop's outputs are architecture judgment, not customer-validated
  claims. All sixteen (H1–H16) still carry forward to MVP Planning.

## Workshop 6 — Three Amigos (Specification by Example)

**Status: complete**, accepted 2026-09-27. See
[`06-three-amigos.md`](./06-three-amigos.md), transcript at
[`transcripts/06-three-amigos.transcript.md`](./transcripts/06-three-amigos.transcript.md).

- 10 Gherkin Features (one per Story Map story; Walking Skeleton subsumed into Feature 5), 27
  scenarios total, each traced to a named business rule or domain-story narrative.
- `stop-three-amigos:evaluate` re-verified independently and found two real gaps: narrative drift
  from the Story Map's exact wording in 5 of 10 Features, and generic non-concrete example data in
  7 of 10 Features. Both fixed. No cross-scenario data dependencies found.
- Zero-Trust coverage stays the H15 deferral, applied consistently across all 10 Features rather
  than fabricating scenarios to hit the methodology's count — explicitly not a new decision.
- No new hypothesis. All sixteen (H1–H16) carry forward to MVP Planning.

## Workshop 7 — UX Design

**Status: complete**, accepted 2026-09-27. See [`07-ux-design.md`](./07-ux-design.md),
mockups at [`mockups/cli-output.svg`](./mockups/cli-output.svg) and
[`mockups/editor-diagnostics.svg`](./mockups/editor-diagnostics.svg), transcript at
[`transcripts/07-ux-design.transcript.md`](./transcripts/07-ux-design.transcript.md).

- 2 real SVG mockups (not Mermaid), each with 3 stacked states — the only two UI surfaces
  md-publisher itself renders. The other 8 Feature-implied surfaces (VS Code Marketplace, npm,
  e-readers, GitHub PR UI) belong to other systems and were explicitly excluded, not invented.
- 3 consolidated screen-flow diagrams (not 10) grouping Story Cards that share a real flow.
- `stop-ux-design:evaluate` found one real gap: the traceability table was Feature-level and
  missed that Feature 6 also has a "refused" scenario. Fixed with a scenario-level table covering
  every scenario across all 10 Features.
- No new hypothesis. All sixteen (H1–H16) carry forward to MVP Planning.

## Workshop 8 — MVP Planning

**Status: complete**, accepted 2026-09-27. See [`08-mvp-plan.md`](./08-mvp-plan.md), transcript at
[`transcripts/08-mvp-planning.transcript.md`](./transcripts/08-mvp-planning.transcript.md).

- **Full Hypothesis Register reconciliation (H1–H16):** no silent strand. 10 entries testable by a
  v1 story; H4 resolved (not stranded) via a founder decision; H5/H8/H9/H10/H15 explicitly marked
  not-testable-this-iteration-by-design, each with a stated reason.
- **Real finding: a drifted build target.** BMC's H4 named DOCX/PDF/EPUB; the VPC (Workshop 2)
  had already introduced "Web" as a fourth target for Docs Writer, never reconciled until this
  workshop caught it. **Founder decision: Web kept as a real fourth v1 target**, H4 revised in
  `01-bmc.md`'s register.
  **v1 build targets are now DOCX, PDF, EPUB, and Web.**
- **Scope decision: full Sprint 1 + Sprint 2 ships as v1** (10 of 10 Story Map stories), not the
  thinner Sprint-1-only option the Story Map's own MVP Slice check made available.
- v1 cut confirmed as a real, coherent walking skeleton, not an incoherent bundle of individually
  justified stories.

## Workshop 9 — Sprint 1 Planning (last of nine)

**Status: complete**, accepted 2026-09-27. See [`09-sprint-1-plan.md`](./09-sprint-1-plan.md),
transcript at
[`transcripts/09-sprint-planning.transcript.md`](./transcripts/09-sprint-planning.transcript.md).

- Greenfield verified independently (twice — once during facilitate, re-verified during evaluate):
  the grammar is still the placeholder, the generator is still a TODO stub, `feat/markdown-grammar`
  has no real work. No migration/reuse finding.
- 11 dependency-ordered tasks, 44 points total. **Founder-directed split** into Sprint 1a
  ("Validate," 18 pts — grammar, structural validation, extension publish-readiness, no
  generation) and Sprint 1b ("Generate," 26 pts — `packages/publishing`, all four generators, CLI
  wiring), following the Language-before-Publishing dependency order rather than an arbitrary cut.
- Acts on Workshop 5's `packages/publishing` recommendation now, as a real Sprint 1b task, rather
  than deferring it again.
- **This is the last of the nine canonical workshops.** Per `stop-sprint-planning:handoff`, the
  next stage is `start-provision-environment` (standing up the dev/CI scaffold Sprint 1 assumes),
  **not** the iteration closing — `stop-mvp-iteration` stays open through Provision Environment and
  actual Scrum Sprint execution.

## Post-workshop: Sprint 1 executed, Sprint 2 (Grammar Expansion) added

Not a tenth workshop — this iteration's canonical workshop sequence is still the nine above. Two
things happened after Workshop 9 that a fast reader of this file needs to know about:

- **Sprint 1 (1a + 1b, all 44 points) was implemented and merged to `dev`**, without
  `start-provision-environment` running first (no CI is configured) — a deliberate sequencing
  choice, not an oversight; see the hand-off memory / PRs #11–#13 for detail.
- **Founder-added scope, 2026-09-28: full CommonMark grammar support**, not sourced from any of
  the nine workshops. Recorded as Finding 3 in [`08-mvp-plan.md`](./08-mvp-plan.md) (amending the
  v1 cut) and planned in [`10-sprint-2-grammar-plan.md`](./10-sprint-2-grammar-plan.md) (85 points,
  split 2a/"Parse" + 2b/"Render" — roughly double Sprint 1's entire size, flagged as a real
  velocity risk in that doc rather than downplayed). Retires BR-2 as a meaningful check (front
  matter is now recognized only at document start, to disambiguate it from CommonMark thematic
  breaks) — a founder-confirmed consequence, not a bug. Sequenced *before* the Story Map's own
  "Sprint 2" (live-typing diagnostics + PR review), which becomes Sprint 3 for execution purposes
  only — `03-user-story-map.md` itself is unmodified.
