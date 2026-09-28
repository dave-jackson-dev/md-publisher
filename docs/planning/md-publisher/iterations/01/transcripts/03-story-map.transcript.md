# Workshop 3 — User Story Map — transcript

**Facilitator:** Claude (agent, product-owner performer), drafting from both `02-vpc-*.md`
canvases. No customer interviews have happened — story titles here are a founder-delegated
best-effort translation of VPC content, not validated.

## The RBAC / Zero Trust question

- **Considered, taken:** name the mismatch explicitly (v1 is single-user/local, no runtime role
  boundary) rather than either force fake "I CANNOT" pairs or silently drop the requirement. Added
  H15 to track when this starts mattering for real (the hosted service).
- **Considered, not taken: writing "I CANNOT" stories anyway, framed as aspirational/future-tense.**
  Rejected — the methodology's own "Technology-Driven Stories" anti-pattern warns against stories
  that don't reflect what's actually being built; a boundary story for a boundary that doesn't
  exist in v1's architecture is exactly that, just inverted (an authorization story instead of a
  technology one).
- **Considered, not taken: skipping the RBAC Permission tuple columns entirely** since there's no
  enforcement in v1. Rejected — Operation/Resource is still useful gnaming, and Access Level is
  recorded as explicitly "n/a" rather than omitted, so a reader sees the gap was addressed, not
  missed.

## Activity backbone

- **Considered, taken:** four Activities (Get Started, Write & Validate, Generate Output, Review &
  Ship), each traced to specific VPC Jobs/Pain Relievers/Gain Creators.
- **Considered, not taken: a separate "Configure Publishing" Activity** for front-matter/chapter-
  ordering rules. Rejected — neither VPC names a Job or Gain specifically about *configuring*
  publishing rules as its own concern (only about validation catching malformed front matter,
  which is a Write & Validate story, not a separate activity); inventing the activity would have
  been exactly the "floating story" anti-pattern one level up, at the Activity rather than Story
  level.

## Sprint assignment

- **Considered, taken:** the methodology's rule (Required → Sprint 1, highest-severity Pain →
  Sprint 2) applied literally, with one judgment call: Docs-as-code's Required Gain "structural
  errors caught before generation" is satisfied by *build-time* validation (Sprint 1); the
  *live-typing* diagnostics (the Expected gain, closely coupled to the same underlying pain) were
  placed in Sprint 2 alongside pain relief, since the methodology's rule doesn't explicitly slot
  "Expected" gains anywhere and Sprint 2 was the closer fit.
- **Considered, not taken: putting live-typing diagnostics in Sprint 1** on the grounds that it's
  cheap once build-time validation exists. Rejected — the methodology's rule ties Sprint 1 strictly
  to Required Gains, and live diagnostics is explicitly an Expected gain in both VPCs; loosening
  the rule here would blur the line MVP Planning (Workshop 8) needs to reconcile scope against.

## Sprint 3

- **Considered, taken:** leave Sprint 3 explicitly empty rather than manufacture a story to fill
  it. The only Desired-tier candidate (theming) is already a decided backlog item, not a sprint
  slot, and the Unexpected gains named in both VPCs aren't independently buildable.

## Founder decisions, 2026-09-27

Accepted as drafted — Activities, stories, sprint placement, and the RBAC/H15 framing all stand.

## `stop-story-map-workshop` self-review (attempt 1 of the ≤3 cap)

`stop-story-map:evaluate`, run against `user-story-mapping.md`'s anti-patterns:

1. **Every story traces to a named VPC entry** — pass, all 8 stories cite their source explicitly.
2. **"I CANNOT" Zero Trust boundary stories exist** — literally, no. Zero exist in the artifact.
   **Judgment call, recorded rather than hidden:** treated as a documented exception, not a pass or
   a silent fail. The artifact carries an unmistakable, prominent methodology-fit note (not a
   footnote) explaining why, plus H15 tracking when the gap starts mattering for real (the hosted
   service). This mirrors the VPC evaluate step's own precedent — a canvas for an explicitly
   out-of-scope segment is exempt from severity/frequency scoring *if it carries an unmistakable
   non-scope marker* — applied here to a structural rather than a segment-scope gap. The
   alternative (fabricating "I CANNOT" stories for a boundary that doesn't exist in v1's
   architecture) would have satisfied the checklist's letter while writing a story about a system
   that doesn't exist, which is worse than the documented gap.
3. **Sprint 1 forms a coherent, deliverable slice, not an arbitrary partial subset** — pass; covers
   install, validation, and generation for both roles across both format families, matching the
   artifact's own MVP Slice check.

`objectiveMet: true`, with the Zero-Trust judgment call stated plainly rather than smoothed over.
