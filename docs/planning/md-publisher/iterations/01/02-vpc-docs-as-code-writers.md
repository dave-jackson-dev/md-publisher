# Value Proposition Canvas — Docs-as-code technical writers, md-publisher Iteration 01

**Status: DRAFT — facilitated, not yet founder-accepted (`vpc:accept` is a separate step).**

Customer Segment name matches `01-bmc.md` exactly: **Docs-as-code technical writers**. Value
Proposition: **Publish Pro**.

**Assumption basis:** this entire Customer Profile is a **founder-delegated assumption**, not
sourced from a customer interview or a prior project's observed history. The founder delegated
drafting to the facilitator (this session) and then reviewed and directed changes to it (see
`transcripts/02-vpc.transcript.md`), which is the traceable source for every line below — not
invented with no source, but not yet validated with a real customer either. Treat Severity/
Frequency ratings below as the founder-delegated estimate they are, to be corrected the moment a
real interview contradicts them.

## Customer Profile

### Customer Jobs

- **Functional:** Ship the same documentation update as web docs, a PDF handout, and sometimes a
  DOCX for legal/reviewer sign-off — from one Markdown source, without maintaining three separate
  build pipelines. Catch structural errors (broken cross-references, malformed front matter)
  before a CI build fails on them. Review a pull request's prose diff without wading through
  generated build artifacts.
- **Emotional:** Feel confident a documentation change won't silently break in one of the three
  output formats after merge. Not dread being the one who has to hand-fix a mangled DOCX export
  before a stakeholder review.
- **Social:** Be seen by the team as the person who solved "we can't keep the PDF/DOCX exports in
  sync with the site," not the one still reconciling them by hand.

### Customer Pains

Severity/Frequency are founder-delegated estimates (see Assumption basis above), not
interview-derived — the highest Severity × Frequency pain is called out for prioritization per the
methodology.

| Pain | Type | Severity | Frequency |
| --- | --- | --- | --- |
| A cross-reference or heading structure that renders fine in the web build silently breaks the PDF's table of contents. | Undesired outcome | High | Occasional |
| A DOCX export comes back from reviewers full of formatting complaints unrelated to the actual content changes. | Undesired outcome | Medium | Frequent |
| No existing tool validates Markdown structure against a project's own publishing rules before generation — errors surface only by generating the output and eyeballing it. | Obstacle | High | Frequent |
| Pandoc-based pipelines need hand-written Lua filters for acceptable DOCX output, and most technical writers don't know Lua. | Obstacle | Medium | Occasional |
| Shipping a PDF or DOCX with a broken reference to a stakeholder or customer damages credibility, not just the document. | Risk | High | Rare |

**Highest priority (Severity × Frequency): "no existing tool validates structure before
generation"** — High severity, Frequent. This is the pain the Value Map's primary Pain Reliever
(parse-time validation) targets first, consistent with H12.

### Customer Gains

- **Required:** One command reliably produces DOCX, PDF, and web-ready output from the same
  source, every time. Structural errors are caught before generation, not discovered after.
- **Expected:** Editor diagnostics (inline errors) for structural problems while writing, not only
  at build time.
- **Desired:** Custom templates/branding per output format, without hand-editing generated files.
- **Unexpected:** The grammar catches an error class the team didn't know it had — e.g. an
  orphaned cross-reference nobody had noticed — on the very first run.

## Value Map — Publish Pro

**Products and Services:** VS Code extension (live validation via the language server) + CLI
(`md-publisher-cli generate`) producing DOCX, PDF, and web-ready output from one `.mdpub` source
tree.

**Pain Relievers** (each traces to a named pain above):

- A Langium-based grammar validates structure — cross-references, front matter, heading order —
  at parse time, in the editor, before any build runs. → relieves *"silently breaks... after
  merge"* and *"errors surface only by generating the output and eyeballing it."*
- The CLI wraps well-tested per-format libraries behind one command, rather than requiring
  hand-written Lua filters. → relieves the *Pandoc/Lua obstacle*.

**Gain Creators** (each traces to a named gain above):

- One command, three formats, from a single validated source. → creates the Required gain
  *"reliably produces... every time."*
- LSP diagnostics surface structural errors as-you-type. → creates the Expected gain *"editor
  diagnostics... not only at build time."*
- **Backlog item, deferred to post-v1 (founder-confirmed 2026-09-27):** *"custom templates/
  branding per output format"* has no Gain Creator in v1 scope. Not silently dropped — tracked as
  a concrete post-v1 backlog item (see `summary.md`), distinct from an open hypothesis: this is a
  scope decision already made, not a question still open. H14 below narrows accordingly.

## Fit check (per the VPC methodology's own review criteria)

- Every Pain Reliever above traces to a named Pain: yes (2 of 2).
- Every Gain Creator traces to a named Gain: yes (2 of 2), with one Desired gain (templates) named
  as an explicit, undeferred gap rather than silently unaddressed.
- Required Gains are all addressed: yes — both Required gains have a Gain Creator.
