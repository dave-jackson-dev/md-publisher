# User Story Map — md-publisher, Iteration 01

**Status: DRAFT — facilitated, not yet founder-accepted (`story-map:accept` is a separate step).**

Sources: `02-vpc-docs-as-code-writers.md`, `02-vpc-oss-indie-authors.md`. Every backbone Activity
and every story below traces to a named VPC Job, Pain Reliever, or Gain Creator — no floating
stories.

**Roles** (from BMC Customer Segments, shortened for story titles, traceability preserved):

| Story Map Role | BMC Customer Segment |
| --- | --- |
| **Docs Writer** | Docs-as-code technical writers |
| **Indie Author** | OSS/indie technical authors |

## ⚠️ Methodology-fit note: RBAC / Zero Trust boundary stories

The methodology requires an "I CANNOT" boundary story for every "I CAN," for Zero Trust validation,
and an RBAC Permission tuple (Role/Operation/Resource/Access Level) per story. **v1 of md-publisher
is a single-user local tool** — a CLI and a VS Code extension running on one person's machine, with
no server, no accounts, and no runtime boundary between "Docs Writer" and "Indie Author" (nobody is
ever logged in as one role while another role's data exists to be denied access to). Forcing
"I CANNOT" pairs here would manufacture a security boundary that doesn't exist in what's being
built, which the methodology's own "Technology-Driven Stories" anti-pattern warns against in spirit.

Permission tuples are still derived below (Operation/Resource), because they're a precise way to
name each capability and because they become load-bearing the moment the **hosted build/publish
service** (BMC's first future paid layer) ships — that service is multi-tenant and Access Level
will matter for real. Until then, Access Level reads "n/a — no runtime enforcement (single-user
local tool)." This is recorded as **H15** below, not silently assumed.

## Walking Skeleton

The thinnest end-to-end slice, proving the parse → validate → generate pipeline before any real
content or additional formats exist.

| Story | Role | Operation / Resource | Traces to |
| --- | --- | --- | --- |
| As a Docs Writer, I CAN Run One CLI Command to Parse a Trivial `.mdpub` File and Generate a One-Page PDF, So that the parse→validate→generate pipeline is proven end-to-end. | Docs Writer | Generate / Document | Both segments' Required Gain: "one command reliably produces output" |

## Sprint 1 — Required Gains

| Activity | Story | Role | Operation / Resource | Traces to |
| --- | --- | --- | --- | --- |
| Get Started | As a Docs Writer, I CAN Install the VS Code Extension from the Marketplace, So that I get validation in the editor I already use. | Docs Writer | Install / Extension | Docs-as-code Job: "keep writing in the tools already used"; BMC Channels |
| Get Started | As an Indie Author, I CAN Install the CLI via npm, So that I can generate output without needing VS Code. | Indie Author | Install / CLI | Indie-author Job: "keep writing in the tools already used"; BMC Channels |
| Write & Validate | As a Docs Writer, I CAN Have Broken Cross-References Flagged at Build Time, So that a build fails loudly instead of shipping a broken PDF table of contents. | Docs Writer | Validate / Document | Docs-as-code Required Gain: "structural errors are caught before generation, not discovered after" |
| Write & Validate | As an Indie Author, I CAN Have Broken Internal Links Flagged at Build Time, So that I never hand a reader an EPUB with a dead link. | Indie Author | Validate / Document | Indie-author Pain Reliever: "validated grammar catches broken cross-references... before EPUB/PDF generation" |
| Generate Output | As a Docs Writer, I CAN Generate DOCX, PDF, and Web Output from One Source with One Command, So that I never maintain three separate build pipelines. | Docs Writer | Generate / Document | Docs-as-code Required Gain: "one command reliably produces DOCX, PDF, and web-ready output... every time" |
| Generate Output | As an Indie Author, I CAN Generate EPUB and PDF from One Source with One Command, So that I never touch Word, InDesign, or LaTeX. | Indie Author | Generate / Document | Indie-author Required Gain + Gain Creator: "one-command EPUB/PDF generation from a validated source" |
| Generate Output | As an Indie Author, I CAN Open the Generated EPUB and Navigate It Without a Broken Link, So that a reader's experience is never undermined by the export step. | Indie Author | Generate / Document | Indie-author Required Gain: "EPUB and PDF that open cleanly, with working internal navigation and links" |

## Sprint 2 — Highest-severity Pains (+ Expected Gains riding the same mechanism)

| Activity | Story | Role | Operation / Resource | Traces to |
| --- | --- | --- | --- | --- |
| Write & Validate | As a Docs Writer, I CAN See Structural Errors Highlighted as I Type, So that I catch a broken cross-reference before I ever try to build. | Docs Writer | Validate / Document | Docs-as-code highest-priority Pain (High/Frequent: "no existing tool validates structure before generation") + Expected Gain: "editor diagnostics... not only at build time" |
| Write & Validate | As an Indie Author, I CAN See Structural Errors Highlighted as I Type, So that I catch a malformed chapter before I ever try to build. | Indie Author | Validate / Document | Indie-author highest-priority Pain (High/Occasional: "broken internal links... surface only after a reader hits them") |
| Review & Ship | As a Docs Writer, I CAN Review Only the Prose Diff of a Pull Request, So that I am not forced to review generated build artifacts to approve a content change. | Docs Writer | Review / Document | Docs-as-code Functional Job: "review a pull request's prose diff without wading through generated build artifacts" — implies generated output is not committed alongside source; an architectural note for Architecture Design (Workshop 5), not decided here |

## Sprint 3 — Desired / Unexpected Gains

**Deliberately thin.** The one Desired-gain candidate for both segments — templates/theming — is
the founder-confirmed post-v1 backlog item from Workshop 2, not a Sprint 3 story. No other
Desired-tier VPC entry exists to source a story from, and the Unexpected gains named in both VPCs
("the tool catches an error class nobody knew was there") are emergent properties of Sprint 1's
validation work, not separately buildable stories. **No stories planned in this row for Iteration
01** — stated explicitly per the methodology's own review criteria, rather than left to imply
nobody looked.

## MVP Slice check (Sprint 1)

Sprint 1 alone creates a coherent, deliverable experience: install → write with build-time
validation → generate multi-format output that opens/renders cleanly. A user completing only
Sprint 1 stories has a working, if unpolished, version of both Publish Pro and Author Kit.

## New hypothesis opened by this workshop

| ID | Hypothesis | Owning workshop |
| --- | --- | --- |
| H15 | RBAC/Zero Trust "I CANNOT" boundary stories are not meaningful for v1 (a single-user local tool) and only become load-bearing once the hosted build/publish service ships — deferring them until then is the right call, not a corner cut. | Story Map |

H1–H14 are not superseded. All fifteen (H1–H15) carry forward to MVP Planning (Workshop 8).
