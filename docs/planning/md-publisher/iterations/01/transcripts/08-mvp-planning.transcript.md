# Workshop 8 — MVP Planning — transcript

**Facilitator:** Claude (agent, product-owner performer), drafting from the full accumulated
corpus. This workshop has no methodology prompt of its own.

## Finding 1: the Web build target

- **Considered, taken:** surface this as an explicit founder decision rather than silently
  resolving it either way (keeping Web, or cutting it to match H4).
- **Considered, not taken: quietly cutting Web to match H4** on the theory that BMC is the
  "authoritative" source and VPC drifted. Rejected — VPC's founder-facilitated content (segments,
  revenue) was explicitly reviewed and accepted; "Web" wasn't flagged as wrong at the time, so
  assuming it's an error rather than an intentional expansion the founder simply didn't reconcile
  against H4 would be presuming an answer, not finding one.
- **Considered, not taken: quietly keeping Web and revising H4 to match.** Same problem in the
  other direction — assumes the founder wants a fourth build target without asking.

## Finding 2: Sprint 1 alone vs. Sprint 1 + Sprint 2

- **Considered, taken:** present both as genuinely live options with a stated proposed default,
  rather than defaulting silently to "everything drafted so far ships."
- **Considered, not taken: treating "ship everything already drafted" as the obvious answer.**
  Rejected — that's exactly the anti-pattern this workshop exists to prevent (scope creep by
  inertia rather than an explicit cut). The Story Map itself already proved Sprint 1 alone is a
  coherent MVP Slice; not naming that as a real option would hide a legitimate faster-to-market
  path.

## Hypothesis reconciliation: distinguishing "not testable by design" from "stranded"

- **Considered, taken:** five entries (H5, H8, H9, H10, H15) marked "not testable this iteration"
  with a stated reason, distinct from H4's "contradicted by scope drift" and distinct from a true
  strand (a hypothesis a story existed to test, until the cut removed that story).
- **Considered, not taken: forcing every hypothesis into "testable" or "stranded" as the only two
  categories**, since the facilitate step's own language is binary ("still testable... or
  explicitly recorded as going untested"). Rejected in favor of being precise about *why* each one
  is untestable — "requires post-launch signal" (H5, H8), "validated through build experience, not
  a customer story" (H9, H10), and "about a layer not in scope at all" (H15) are different facts
  worth keeping distinct, even if all four route to the same "untested this iteration" bucket the
  facilitate step names. Precision here matters for whoever reads this a year from now and asks
  "why wasn't this tested" — a single undifferentiated "untested" bucket would lose the answer.

## Founder decisions, 2026-09-27

1. **Finding 1 (Web target): kept as a real fourth v1 build target.** Not a drift to cut — an
   intentional scope decision. H4 revised in `01-bmc.md`'s register to name four targets
   (DOCX/PDF/EPUB/Web), not three, with the revision's provenance stated explicitly (surfaced by
   this workshop's reconciliation, not present at BMC's original drafting).
2. **Finding 2 (scope): the fuller Sprint 1 + Sprint 2 slice ships as v1** (10 stories), not the
   thinner Sprint-1-only release. `08-mvp-plan.md` updated to state the cut as decided rather than
   pending.

Both findings resolved by explicit founder choice, not defaulted to by inertia — matching the
reasoning above for why neither was silently resolved during facilitation.
