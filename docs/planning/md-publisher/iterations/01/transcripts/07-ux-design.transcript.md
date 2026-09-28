# Workshop 7 — UX Design — transcript

**Facilitator:** Claude (agent, ux-designer performer), drafting from `06-three-amigos.md`.

## Two screens, not a screen per Feature

- **Considered, taken:** only `cli-output.svg` and `editor-diagnostics.svg` — the two UI surfaces
  md-publisher itself renders.
- **Considered, not taken: designing a screen for every Feature** (e.g. a Marketplace install
  screen, an npm terminal screen, an e-reader screen, a GitHub PR screen). Rejected outright — this
  is exactly the Untraceable Screens anti-pattern in reverse: those UIs belong to VS Code, npm, a
  third-party e-reader, and GitHub respectively, and md-publisher has no design control over any of
  them. Mocking them would invent scope, not represent it.

## Mermaid for flow, real SVG for screen content — enforced

- **Considered, taken:** hand-authored SVG (`<rect>`/`<text>`/`<path>`) for both mockups; Mermaid
  only for the navigation flow diagrams.
- **Considered, not taken: Mermaid for the mockups too**, since it would have been faster.
  Rejected — this is the workshop's own non-negotiable rule ("a Mermaid flowchart submitted in
  place of a screen's own visual content fails this workshop outright"), not a style preference to
  weigh against convenience.

## 3 screen-flow diagrams, not 10

- **Considered, taken:** one diagram per group of Story Cards that share both a screen and a real
  flow (Flow A: Features 3/4; Flow B: Features 5/6; Flow C: Features 8/9), with Features 1, 2, 7,
  10 explicitly getting none.
- **Considered, not taken: a literal one-diagram-per-Story-Card reading of the instruction**,
  producing 10 diagrams including 4 trivial/empty ones for stories with no md-publisher screen.
  Rejected — an empty diagram for "install via npm" would either be blank (adding nothing) or
  force-fit a fake node just to exist, which is the same invented-scope problem the two-screens
  decision above already rejected. The traceability table already accounts for those four
  Features explicitly, so nothing is silently dropped — it's consolidated, not omitted.

## CLI output: one screen, three stacked states

- **Considered, taken:** a single `cli-output.svg` with three labeled, stacked terminal-window
  states (success, refused, partial) rather than three separate SVG files.
- **Considered, not taken: three separate mockup files, one per state.** Rejected — the workshop's
  own guidance explicitly allows one screen to represent multiple related `Then` states (its own
  loading/populated/error example), and these three states are the same screen (a terminal
  running `md-publisher-cli generate`) at three different outcomes, not three different screens.

## `stop-ux-design-workshop` self-review (attempt 1 of the ≤3 cap)

The mandatory format re-check passed cleanly: both `mockups/*.svg` are real positioned SVG markup,
no Mermaid substituted in. The traceability re-check found a real gap: the first draft's table was
Feature-level, and missed that **Feature 6 also has a "refused" scenario** (not just its
build-target-violation and success scenarios), and glossed over that Feature 5's subset/regenerate
scenarios aren't drawn as their own visual state. Rewrote the table scenario-by-scenario; every
scenario across all 10 Features is now explicitly accounted for, either against a drawn state or a
stated pattern-match reasoning (not a new drawing, but not silently dropped either).

`objectiveMet: true` on the corrected table.

## Founder decisions, 2026-09-27

(recorded once given — see below)
