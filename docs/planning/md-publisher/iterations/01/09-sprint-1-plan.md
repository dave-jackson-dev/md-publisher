# Sprint 1 Planning — md-publisher, Iteration 01

**Status: DRAFT — facilitated, not yet founder-accepted (`sprint-planning:accept` is a separate
step).**

Sources: `08-mvp-plan.md` (the v1 cut) and `05-architecture-design.md` (the dependency map).
**Scoped to Sprint 1 only** — Sprint 2's three stories (live-typing diagnostics ×2, PR-review
workflow) take their own later Sprint Planning cycle, not this one.

## Greenfield verification (performed, not assumed)

Checked the actual repository state directly, not the architecture document's description of it:

- `packages/language/src/md-publisher.langium` is still the Langium generator's placeholder
  grammar (`Element: 'element' name=ID;`) — no real grammar exists.
- `packages/cli/src/generator.ts` is still a `// TODO: place here generated code` stub.
- `feat/markdown-grammar` (opened earlier this session) has no commits beyond the same two commits
  `dev` had at the time — no grammar work has actually happened there.

**Confirmed genuinely greenfield.** No migration or reuse finding to isolate and confirm — the
"verify before assuming greenfield" check found nothing that changes the estimate.

## Task breakdown, dependency-ordered, split across two sub-sprints

Points are Fibonacci-ish (1/2/3/5/8), estimating specification complexity per the methodology, not
raw code size. **Velocity is unknown** — H9 and H10 (whether the founder's own time, and three
generators' maintenance, are sustainable) are still unvalidated; these are first estimates, not a
committed team velocity.

**Split, founder-confirmed 2026-09-27:** the original 44-point breakdown was too large for one
sprint. The dependency map itself supplies the natural cut — **validation needs no generator to
ship real value**, so Language-context work becomes its own sub-sprint before any Publishing-context
work begins.

### Sprint 1a — "Validate" (18 points)

Ships: a real grammar, build-time structural validation, and a publishable VS Code extension. A
complete, coherent, shippable slice on its own — *"install the extension, get real validation"* —
with no generator involved at all.

| Task | Bounded context | Traces to | Points |
| --- | --- | --- | --- |
| T1: Write the real `.mdpub` grammar (headings, front matter, cross-references), replacing the placeholder | Language | Domain Story 1; Features 3/4 | 8 |
| T2: Cross-reference resolution + Structure Violation (BR-1, BR-4) | Language | Feature 3 Scenarios 2–3 | 5 |
| T3: Front-matter-order and heading-level-skip checks (BR-2, BR-3) | Language | Feature 4 Scenarios 1–2 | 3 |
| T10: VS Code Marketplace publish readiness | packages/extension | Feature 1 | 2 |

### Sprint 1b — "Generate" (26 points)

Ships: `packages/publishing` extracted, all four generators, CLI wiring, npm publish readiness.
Depends on Sprint 1a's validated `Publication` model per the dependency map (Write & Validate
before Generate Output) — starts only once 1a is green, not in parallel with it.

| Task | Bounded context | Traces to | Points |
| --- | --- | --- | --- |
| T4: Scaffold `packages/publishing` and move the CLI's placeholder generator logic into it | Publishing | Architecture Design's recommendation, acted on now rather than deferred | 3 |
| T5: DOCX generator (port + adapter) | Publishing | Feature 5 | 5 |
| T6: PDF generator (port + adapter) | Publishing | Features 5, 6 | 5 |
| T7: Web output generator | Publishing | Feature 5 (H4's revised fourth target) | 3 |
| T8: EPUB generator (port + adapter), including table-of-contents validation (BR-6) | Publishing | Feature 6 Scenario 2, Feature 7 | 5 |
| T9: CLI `generate` command wiring — refusal-on-violation, silent overwrite (BR-5) | packages/cli | Feature 5 Scenarios 3–4 | 3 |
| T11: npm package publish readiness | packages/cli | Feature 2 | 2 |

**Total: 44 points across both, 18 + 26.** No prior sprint's velocity exists to compare against —
flagged honestly rather than presented as a confident commitment, even after splitting.

## Sprint Goals

> **Sprint 1a:** By the end of Sprint 1a, Docs Writers and Indie Authors will be able to install
> md-publisher and write `.mdpub` source with real build-time structural validation — Features 3
> and 4's specifications passing for real, not against mocks. No generation yet.

> **Sprint 1b:** By the end of Sprint 1b, the same audience will be able to generate DOCX, PDF,
> Web, and EPUB output from one command against a validated Publication — Features 2, 5, 6, and 7's
> specifications passing for real.

## Feature branches (for when Sprint 1 execution begins — not created by this workshop)

Per the methodology's one-branch-per-story convention, Golden-Thread-named:

`story/mdpub-grammar-and-validation`, `story/generate-docx-pdf-web`, `story/generate-epub-pdf`,
`story/vscode-extension-publish`, `story/cli-npm-publish`. These are proposed names for Sprint 1
execution's own future branches — this workshop is planning, not implementation, and creates none
of them.
