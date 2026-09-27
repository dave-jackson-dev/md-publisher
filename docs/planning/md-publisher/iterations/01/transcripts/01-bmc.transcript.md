# Workshop 1 — Business Model Canvas — transcript

**Facilitator:** Claude (agent, product-owner performer), drafting from repository context
(README/AGENTS.md, the Langium grammar scaffold, and the stated goal of shipping DOCX/PDF/EPUB
build targets) in the absence of prior customer interviews. **Founder acceptance is pending** —
this transcript records what was considered before the founder has reacted, per
`bmc:facilitate`'s requirement to record options considered and *not* taken.

## Customer Segments

- **Considered, taken (as a draft):** two segments — "docs-as-code technical writers" and
  "OSS/indie technical authors." Chosen because they map to genuinely different Value
  Propositions (validation-first tooling for teams already in a docs-as-code pipeline, vs. a
  self-serve kit for a solo author with no team) and because the repo's own three build targets
  (DOCX/PDF/EPUB) split cleanly across "reviewer-facing," "print/distribution-facing," and
  "e-reader-facing" needs that both segments plausibly share for different reasons.
- **Considered, not taken: a single undifferentiated "Markdown authors" segment.** Rejected as an
  anti-pattern the methodology names explicitly (vague segments) — collapsing two populations with
  different relationships to git/CI/VS Code into one segment would blur which Value Proposition
  and which platform app either of them actually wants.
- **Considered, not taken: enterprise documentation platforms/teams (e.g. companies replacing a
  paid docs tool) as a third segment.** Rejected for v1 as premature scope — no evidence yet that
  a Langium-based OSS tool competes credibly with commercial docs platforms, and adding a third
  segment before the first two are validated risks spreading a solo-maintainer project thin. Not
  discarded permanently — flagged as a candidate to revisit after H1–H4 are tested, not written
  into this canvas.

## Value Propositions

- **Considered, taken:** "Validate & Publish" (Publish Pro) for docs-as-code writers, emphasizing
  parse-time structural validation as the differentiator over a plain converter; "Self-Publish Kit"
  (Author Kit) for OSS/indie authors, emphasizing avoiding LaTeX/Pandoc-filter/commercial-tool
  friction.
- **Considered, not taken: leading with "one source, three formats" as the primary value
  proposition for both segments**, treating validation as secondary. Rejected because "one source,
  many formats" is already Pandoc's core pitch and isn't a differentiator on its own (H3 names this
  directly as unvalidated) — validation-before-generation is the more defensible claim, so it's
  foregrounded, but this remains a hypothesis, not a confirmed advantage.

## Revenue Streams

- **Considered, taken:** no revenue stream for v1; adoption as the substitute leading indicator;
  sponsorship named as an open, unpursued hypothesis (H5).
- **Considered, not taken: a "free CLI / paid VS Code extension" or "free core / paid hosted
  build service" split**, modeled after common OSS-to-commercial patterns. Rejected for now as
  premature — no adoption yet to monetize, and deciding a monetization split before the tool has
  any users risks shaping v1 scope around a business model with zero evidence behind it. **This is
  the block most likely to need founder correction** — the methodology ties Revenue Streams
  directly to feature prioritization ("Why?"), and an OSS project needs an explicit substitute
  logic (adoption, sponsorship, something else) rather than silently skipping the question.

## Key Partners / Cost Structure

- **Considered, not taken: treating "the three format libraries" as an implementation detail
  rather than a canvas-level Key Partner.** Rejected — the methodology explicitly traces Key
  Partners → Integration Boundaries, and DOCX/PDF/EPUB each pulling in a distinct third-party
  library is exactly the kind of integration-boundary information Architecture Design (Workshop 5)
  will need, so it's named here rather than deferred.

## Founder decisions, 2026-09-27

1. **Customer Segments confirmed as drafted** — both segments and their named platform apps
   (Publish Pro / Author Kit) stand.
2. **Revenue Streams revised: plan the paid tier now, not later.** Considered and rejected (by the
   founder's own choice): the "adoption-only, revenue deferred indefinitely" framing originally
   drafted. Taken instead: v1 ships free/OSS with no billing, but three future paid layers are
   named now — hosted build/publish service, Pro features (templates/theming/advanced
   cross-references), and Enterprise/team support (contracts, SLAs, shared config) — so that v1
   scope decisions (Workshop 8, MVP Planning) can weight capabilities that extend toward one of the
   three higher than ones that don't. H5 (revised) and H6 (new) capture this as still-unvalidated
   hypotheses — no customer has confirmed demand for any of the three layers yet.
3. Nothing in H1–H4 was struck or reworded; H5 was narrowed from "sponsorship" specifically to "at
   least one of the three paid layers," and H6 was added to track the scope-discipline risk of
   over-building v1 toward revenue streams with no validated customer.

## `stop-bmc-workshop` self-review (attempt 1 of the ≤3 cap)

`stop-bmc:evaluate`, run against `business-model-canvas.md`'s own anti-pattern checklist, found
`objectiveMet: false` on one check: **not every block carried a Hypothesis Register entry** —
Channels, Customer Relationships, Key Resources, Key Activities and Key Partners had none, only
Customer Segments, Value Propositions, Revenue Streams and (weakly) Cost Structure did. The other
two checks passed (all nine blocks hold specific, non-vague content; the Value-Propositions →
Revenue-Streams line is explicit).

**Fix applied (still attempt 1, no new founder content decision):** added H7 (Channels), H8
(Customer Relationships), H9 (Key Resources + Cost Structure — time is both), H10 (Key Activities),
H11 (Key Partners) — five entries closing the coverage gap. This is a completeness fix to the
Hypothesis Register, not a change to any block's content or to either decision the founder already
made (Customer Segments, Revenue Streams framing), so it is reported to the founder rather than
routed through another `bmc:accept` cycle.

Re-run of `stop-bmc:evaluate` against the revised artifact: `objectiveMet: true`, no remaining
anti-pattern violations.
