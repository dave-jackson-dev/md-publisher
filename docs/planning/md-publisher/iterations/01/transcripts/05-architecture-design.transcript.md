# Workshop 5 — Architecture Design — transcript

**Facilitator:** Claude (agent, architect performer), drafting from `04-domain-storytelling.md`.

## Bounded context count: two, not three

- **Considered, taken:** two bounded contexts (Language, Publishing), with Story 3 (Review & Ship)
  explicitly getting none of its own.
- **Considered, not taken: a "Review" or "CI" bounded context** for Story 3's PullRequest/Reviewer/
  ContinuousIntegration. Rejected — none of those are things md-publisher's own domain model would
  own or persist; they belong to the git-hosting platform and CI runner. Naming a bounded context
  for them would be exactly the "Invented Aggregates" anti-pattern this workshop is meant to catch,
  just at the context level rather than the aggregate level.

## Document as an entity, not its own aggregate

- **Considered, taken:** `Publication` as the sole aggregate root in the Language context, with
  `Document` as an entity inside it.
- **Considered, not taken: `Document` as its own aggregate root**, independently valid or invalid.
  Rejected — cross-reference validation (BR-1, BR-4) is inherently relative to sibling Documents in
  the same Publication; a Document can't be meaningfully validated in isolation, which is exactly
  what an aggregate boundary is supposed to protect (consistency that must hold together).

## Generator as a service, not an aggregate

- **Considered, taken:** `Generator` modeled as a domain service producing `OutputArtifact` values,
  no aggregate root in the Publishing context.
- **Considered, not taken: `OutputArtifact` as an aggregate root** with its own lifecycle/state
  machine. Rejected — BR-5 (silent overwrite, founder-confirmed in Workshop 4) means an
  OutputArtifact has no state worth protecting: it's always fully reproducible from its source
  Publication and never independently mutated. Forcing an aggregate boundary around something with
  no real invariant to protect would be over-modeling.

## The packages/publishing recommendation

- **Considered, taken:** flag now, as an explicit architecture recommendation, that Generation
  logic should move out of `packages/cli` into its own package once the extension needs it too.
- **Considered, not taken: staying silent and letting this surface naturally during
  implementation.** Rejected — this is exactly the kind of thing the workshop exists to catch
  early ("sequencing conflicts are cheaper to catch here than after implementation starts" applies
  to structural placement too, not only ordering). Flagged as a judgment call without live
  implementation experience, not asserted as certain.

## Founder decisions, 2026-09-27

(recorded once given — see below)
