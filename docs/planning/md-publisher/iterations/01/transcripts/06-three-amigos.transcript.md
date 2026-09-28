# Workshop 6 — Three Amigos (Specification by Example) — transcript

**Facilitator:** Claude (agent, qa-tester performer), drafting from `04-domain-storytelling.md` and
`05-architecture-design.md`.

## Zero-Trust scenarios: consistent deferral, not a new decision

- **Considered, taken:** every Feature states "No Zero-Trust scenario — see H15" explicitly,
  applying the founder-confirmed Workshop 3 decision downstream rather than re-litigating it.
- **Considered, not taken: writing at least one `@zero-trust`-tagged scenario per Feature anyway**,
  to satisfy the methodology's literal requirement. Rejected — this facilitate step itself warns
  against exactly this failure mode (the "0 of 136 actually tagged" regex incident): a scenario
  that tests no real security boundary, written only to hit a count, is worse than an honest gap.
  Not re-asking the founder a third time on the same underlying question — H15 already settled it.

## Scope: 10 Features, not 11 or fewer

- **Considered, taken:** one Feature per Story Map "I CAN" story (10 stories → 10 Features), with
  the Walking Skeleton explicitly subsumed into Feature 5 rather than given its own Feature.
- **Considered, not taken: a separate Walking Skeleton Feature.** Rejected — it introduces no new
  "I CAN" vocabulary beyond Feature 5; a separate Feature would be a redundant specification, and
  the facilitate step's own "Story Without Rules"-adjacent concern (from Domain Storytelling) about
  padding for completeness' sake applies here in reverse.
- **Considered, not taken: combining the Docs Writer / Indie Author variants of the same
  mechanical story (Features 3/4, 5/6, 8/9) into single Scenario Outlines** parameterized by role.
  Rejected — the Story Map gave each variant a distinct title (different wording: cross-references
  vs. internal links, DOCX/PDF/Web vs. EPUB/PDF), and Feature title must match User Story title
  exactly (Golden Thread) — collapsing them would break that 1:1 correspondence even though the
  underlying scenarios are structurally similar. Kept as separate Features, but written tersely
  where a later one is mechanically identical to an earlier one (Features 4, 9) rather than
  padded with full duplicate scenario text.

## Scenario density per Feature

- **Considered, taken:** 2–4 scenarios per Feature (happy path, at least one edge case, an error
  condition where a distinct rule supports one), each traced to a specific business rule or the
  domain story's own narrative text.
- **Considered, not taken: a uniform 4-scenario template (happy/edge/error/zero-trust) applied
  mechanically to every Feature regardless of whether the domain actually supports that many
  distinct cases.** Rejected — Feature 7 (EPUB navigation) has no error condition of its own
  because Feature 4/6 already own broken-link detection at build time; forcing a 4th scenario there
  would manufacture content, not specify behavior.

## `stop-three-amigos-workshop` self-review (attempt 1 of the ≤3 cap)

`stop-three-amigos:evaluate` re-verified the Start half's own work, per its explicit instruction
not to rely on facilitate's self-check, and found two real problems:

1. **Narrative drift in 5 of 10 Features.** Feature 1 dropped "from the Marketplace" and added
   "live" where the Story Map didn't; Features 5 and 6 dropped "from One Source"; Features 8 and 9
   substituted "ever" for the Story Map's "even." All five fixed to match `03-user-story-map.md`
   exactly, word for word.
2. **Generic, non-concrete example data** in most of the domain-content scenarios (Features 3, 4,
   5, 6, 8, 9, 10) — phrases like "a Cross-Reference to a heading that does not exist" with no
   actual heading or filename named. Fixed by naming concrete Documents ("guide.mdpub",
   "chapter-1.mdpub"), concrete headings ("## Setup", "#getting-started"), and concrete CLI
   invocations (`md-publisher-cli generate user-guide --targets pdf`) throughout. Features 1, 2,
   and 7 already had adequate concreteness (version numbers, chapter counts) and needed no fix.

No cross-Scenario data dependency found within any Feature — every scenario's `Given` establishes
its own starting state rather than depending on a sibling scenario having run. Zero-Trust coverage
remains the H15 deferral, applied consistently, not a new finding.

`objectiveMet: true` on the corrected artifact.

## Founder decisions, 2026-09-27

(recorded once given — see below)
