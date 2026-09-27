# Workshop 4 — Domain Storytelling — transcript

**Facilitator:** Claude (agent, architect performer, per this workshop's facilitate step), drafting
from `03-user-story-map.md`. No domain expert was interviewed — see the artifact's own
methodology-fit note; this is the workshop's biggest departure from how it's meant to run.

## Scope: excluding "Get Started"

- **Considered, taken:** tell domain stories for 3 of 4 backbone Activities, explicitly excluding
  Get Started (install) as having no business-rule content.
- **Considered, not taken: forcing a thin domain story for Get Started** (e.g. "Actor installs
  Extension from Marketplace"). Rejected — there's no constraint question with a real answer
  ("what happens if it's already installed?" has no domain rule behind it, just ordinary package-
  manager behavior), and a story with no discovered rule is exactly what "Story Without Rules" (an
  anti-pattern) warns against.

## Docs Writer / Indie Author: one story or two?

- **Considered, taken:** one shared Story 1 (Write & Validate) noting explicitly that both actors
  go through an identical flow, rather than writing the same sequence twice under two names.
- **Considered, not taken: collapsing "Docs Writer" and "Indie Author" into a single new Actor**
  (e.g. "Author") since the domain-level flow is identical. Rejected — the methodology's own Golden
  Thread table ties Actor names directly to frozen Story Map Roles, and inventing a third name here
  would itself be the "Synonym Tolerance" anti-pattern, just introduced one workshop later than
  usual. The two names stay distinct at the vocabulary level even though the flow is shared; that
  redundancy is itself a finding worth flagging to Architecture Design (Workshop 5), not something
  to paper over by merging roles this workshop has no authority to merge.

## The overwrite question (BR-5 / H16)

- **Considered, taken:** state the rule as drafted ("overwrites without prompting") but mark it
  explicitly as an unconfirmed product call (H16), not a discovered domain rule, since nothing in
  BMC/VPC/Story Map settles it.
- **Considered, not taken: silently picking a behavior and presenting it as settled.** Rejected —
  this is exactly the kind of decision the founder should make, not one a facilitator should invent
  and bury in a business-rule list that otherwise reads as discovered fact.

## Founder decisions, 2026-09-27

BR-5/H16: silent overwrite confirmed as drafted, no warn/force-flag added. Artifact updated to
record this as a founder decision rather than an open hypothesis (H16 narrowed to "does this hold
once tested," matching the pattern set by H13/H14 in Workshop 2). Everything else accepted as
drafted.
