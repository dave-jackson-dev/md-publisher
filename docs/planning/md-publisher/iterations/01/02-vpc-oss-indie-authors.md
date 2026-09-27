# Value Proposition Canvas — OSS/indie technical authors, md-publisher Iteration 01

**Status: DRAFT — facilitated, not yet founder-accepted (`vpc:accept` is a separate step).**

Customer Segment name matches `01-bmc.md` exactly: **OSS/indie technical authors**. Value
Proposition: **Author Kit**.

**Assumption basis:** this entire Customer Profile is a **founder-delegated assumption**, not
sourced from a customer interview or a prior project's observed history. The founder delegated
drafting to the facilitator (this session) and then reviewed and directed changes to it (see
`transcripts/02-vpc.transcript.md`), which is the traceable source for every line below — not
invented with no source, but not yet validated with a real customer either. Treat Severity/
Frequency ratings below as the founder-delegated estimate they are, to be corrected the moment a
real interview contradicts them.

## Customer Profile

### Customer Jobs

- **Functional:** Turn a Markdown source tree (a project handbook, a technical guide, a zine)
  into a submission-ready EPUB and PDF without owning Word/InDesign or hand-rolling LaTeX. Keep
  writing in the tools already used for code — git, a plain text editor, VS Code.
- **Emotional:** Feel like a genuinely professional publication is achievable solo, without a
  formatter or a publishing service. Not feel embarrassed handing a reader an EPUB with broken
  internal links or a mangled table of contents.
- **Social:** Be seen as someone who shipped a polished, professional-looking guide or book — not
  an obviously homemade one.

### Customer Pains

Severity/Frequency are founder-delegated estimates (see Assumption basis above), not
interview-derived.

| Pain | Type | Severity | Frequency |
| --- | --- | --- | --- |
| Generic Pandoc conversion produces an EPUB/PDF that visibly "looks like Pandoc made it" — inconsistent spacing, no real typographic care. | Undesired outcome | Medium | Frequent |
| Broken internal links or cross-references in the EPUB surface only after a reader hits them, with no way to catch them beforehand. | Undesired outcome | High | Occasional |
| Zero budget for a professional formatter or commercial layout tool. | Obstacle | High | Frequent |
| LaTeX has a learning curve most technical authors haven't already climbed. | Obstacle | Medium | Frequent |
| A self-published guide with visible formatting defects undermines the author's credibility more than a plain-but-clean one would. | Risk | High | Rare |

**Highest priority (Severity × Frequency): "zero budget for a professional formatter."** This is
why "no paid software required" is a Required gain rather than merely Expected, and why Author Kit
leads with being free/OSS rather than with output quality alone.

### Customer Gains

- **Required:** EPUB and PDF that open cleanly, with working internal navigation and links. No
  paid software required, end to end.
- **Expected:** Reasonable-looking default typography without manual tuning.
- **Desired:** A few built-in themes/templates to choose from.
- **Unexpected:** The tool catches a broken link or malformed chapter structure the author didn't
  know was there.

## Value Map — Author Kit

**Products and Services:** the same CLI + VS Code extension core as Publish Pro, documented and
positioned for solo self-publishers rather than doc teams.

**Pain Relievers** (each traces to a named pain above):

- A validated Markdown grammar catches broken cross-references and malformed chapter structure
  before EPUB/PDF generation. → relieves *"broken internal links... surface only after a reader
  hits them."*
- Free, OSS, CLI + extension — no paid software anywhere in the pipeline. → relieves the *zero-
  budget obstacle*.

**Gain Creators** (each traces to a named gain above):

- One-command EPUB/PDF generation from a validated source. → creates the Required gain *"opens
  cleanly, with working internal navigation."*
- **Backlog item, deferred to post-v1 (founder-confirmed 2026-09-27):** *"a few built-in themes/
  templates"* has no Gain Creator in v1 scope. Default output is plain-but-clean typography (the
  Expected gain), not themed. Not silently dropped — tracked as a concrete post-v1 backlog item
  (see `summary.md`). H13 below narrows accordingly: it no longer asks *whether* to defer theming
  (decided), only whether Required-only adoption actually holds once tested.

## Fit check (per the VPC methodology's own review criteria)

- Every Pain Reliever above traces to a named Pain: yes (2 of 2).
- Every Gain Creator traces to a named Gain: yes (1 of 1 built), with the Desired "themes" gain
  named as an explicit gap.
- Required Gains are all addressed: yes — both Required gains ("opens cleanly", "no paid
  software") have a Gain Creator or Pain Reliever behind them.
- **Segment-confusion check:** this segment's pain profile (budget, LaTeX unfamiliarity, wanting
  to look "professional" solo) reads as genuinely distinct from Docs-as-code technical writers'
  (CI breakage, reviewer formatting complaints, team coordination) — no signal that these are
  actually one segment wearing two names, or that either should split further.
