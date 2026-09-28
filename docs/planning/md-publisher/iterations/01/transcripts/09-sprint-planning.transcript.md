# Workshop 9 — Sprint 1 Planning — transcript

**Facilitator:** Claude (agent, developer performer), drafting from `08-mvp-plan.md` and
`05-architecture-design.md`. This is the last of the nine canonical workshops.

## Greenfield verification

- **Considered, taken:** actually read the current grammar/generator files and check
  `feat/markdown-grammar`'s commit history, rather than trusting Architecture Design's description.
- **Considered, not taken: trusting `05-architecture-design.md`'s "not yet built" framing at face
  value.** Rejected — the facilitate step explicitly warns that a description can be wrong or later
  corrected, and this session's own earlier work (opening `feat/markdown-grammar` without touching
  it) is exactly the kind of state a written description could plausibly get wrong if not
  re-checked.

## Acting on the packages/publishing recommendation now, not deferring again

- **Considered, taken:** T4 scaffolds `packages/publishing` as an early Foundation task, operating
  on Architecture Design's flagged-but-not-acted-on recommendation.
- **Considered, not taken: leaving it as a recommendation for some future, unspecified point.**
  Rejected — Sprint Planning is exactly where an architecture judgment call either gets scheduled
  or quietly never happens; deferring it again would be the same drift pattern Workshop 8 found
  with the Web build target, just at the architecture level instead of the hypothesis level.

## Estimating with real uncertainty stated, not hidden

- **Considered, taken:** flag the 44-point total honestly against H9/H10's still-open question
  about solo-maintainer sustainability, rather than presenting the breakdown as an obviously
  achievable sprint.
- **Considered, not taken: silently capping the estimate to look like a clean single sprint** (e.g.
  by underestimating T1, the grammar work). Rejected — the anti-pattern this would risk is "Done
  Without Green" one level up: a sprint plan whose numbers were shaped to look achievable rather
  than estimated honestly is the planning-stage version of declaring a story complete without it
  actually being green.

## No hypothesis reconciliation here — that was Workshop 8's job

- **Considered, taken:** this workshop produces the task breakdown only; it does not re-open
  H1–H16.
- **Considered, not taken: re-reconciling hypotheses against the task breakdown.** Rejected — the
  facilitate step's own scope is dependency-ordered estimation, and re-litigating scope here would
  blur this workshop's job with Workshop 8's, which already did that reconciliation properly.

## Founder decisions, 2026-09-27

**44 points was too large for one sprint — split explicitly, founder-directed.** The dependency map
supplied the cut: Language-context work (grammar + validation) ships real value with zero
Publishing-context work involved, so it becomes Sprint 1a (18 points) on its own, with Publishing
(all four generators + CLI wiring) as Sprint 1b (26 points), which only starts once 1a is green —
matching the dependency map's own Write & Validate before Generate Output ordering, not an
arbitrary cut.

- **Considered, not taken: splitting by generator instead** (e.g. "DOCX+PDF now, EPUB+Web later").
  Rejected — that would split the Publishing context internally without a real dependency forcing
  it (BR-7 says the four generators are independent of *each other*, not that some are more urgent
  than others), where the Language/Publishing split follows an actual architectural dependency
  already established in Workshop 5.
- **Considered, not taken: an even finer split** (e.g. one generator per sub-sprint, four
  sub-sprints for Sprint 1b). Rejected as more ceremony than the actual uncertainty warranted — 26
  points across four independent, similarly-shaped generator tasks is a more ordinary sprint size
  than the original 44-point blob was.
