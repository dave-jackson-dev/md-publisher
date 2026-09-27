# Business Model Canvas — md-publisher, Iteration 01

**Status: revised per founder input on Customer Segments and Revenue Streams — pending final
`bmc:accept`.**

Per the Lean-Agile MVP methodology, names fixed here propagate unchanged downstream: Customer
Segments → Roles, Value Propositions → Platform Apps, Channels → Deployment Targets, Key Partners →
Integration Boundaries. Customer Segments were confirmed as drafted. Revenue Streams was revised
below per the founder's explicit direction — see the Hypothesis Register and the transcript.

| Block | Content |
| --- | --- |
| **Customer Segments** | 1. **Docs-as-code technical writers** — technical writers and API-documentation teams who already work in Markdown + git + VS Code, currently hand-rolling pandoc/CI scripts to ship DOCX (for reviewers), PDF (for distribution) and EPUB (for e-readers) from one source.<br>2. **OSS/indie technical authors** — open-source maintainers and independent technical authors (project handbooks, zines, technical guides) who want the same single-source, multi-format output, self-serve, with no team and no budget for commercial tooling. |
| **Value Propositions** | 1. **"Validate & Publish"** (for docs-as-code writers) — a real Markdown grammar (not a regex-based linter) catches structural errors — broken cross-references, malformed front matter, an out-of-place heading — as you type, via the language server; one command then generates consistent DOCX/PDF/EPUB from the same validated source. Named platform app: **Publish Pro**.<br>2. **"Self-Publish Kit"** (for OSS/indie authors) — CLI + VS Code extension that turns a Markdown source tree into submission-ready EPUB/PDF/DOCX without learning LaTeX, wrangling Pandoc filters, or buying Word/InDesign. Named platform app: **Author Kit**. |
| **Channels** | VS Code Marketplace (extension — primary discovery surface for both segments); npm registry (CLI package — for CI pipelines and non-VS-Code use); the GitHub repository itself (README, docs site — top-of-funnel for an OSS dev tool, since there is no other marketing channel). |
| **Customer Relationships** | Self-service, community-supported: GitHub Issues/Discussions, no paid support tier. Documentation-led onboarding — for a solo-maintainer OSS tool, the docs *are* the relationship. |
| **Revenue Streams** | **Open-core, three-layer plan, founder-directed 2026-09-27.** v1 itself ships free/OSS (CLI + VS Code extension: grammar, validation, local DOCX/PDF/EPUB generation) — no billing in v1. Three future paid layers, planned for now so v1 scope is chosen with them in mind: (1) **Hosted build/publish service** — CI-less build automation, webhooks, publishing pipelines on top of the free core; (2) **Pro features** in the extension/CLI — premium DOCX/PDF templates, branding/theming, advanced cross-reference/citation support, gated in an otherwise-OSS tool; (3) **Enterprise/team support** — support contracts, SLAs, shared style guides, centralized team config. Prioritization signal for MVP Planning (Workshop 8): a v1 capability that a paid layer will later sit on top of (e.g., a clean template/theming seam, a webhook-friendly CLI interface) is weighted higher than one that doesn't extend toward any of the three. |
| **Key Resources** | The Langium framework and its parser/LSP infrastructure (upstream dependency, not owned); the VS Code extension APIs; the npm registry; the founder's own maintenance time — the scarcest resource in a solo-maintainer OSS project, and the thing that should bound v1 scope. |
| **Key Activities** | Grammar development and maintenance; per-format generator maintenance (DOCX/PDF/EPUB backends — three separate integration surfaces, see Key Partners); issue triage and community support; documentation; release management. |
| **Key Partners** | The Langium/Eclipse Langium project (grammar/LSP engine); a DOCX-writing library; a PDF-rendering engine; an EPUB packaging library (three distinct integration boundaries — one per build target, not one generic "export" module); the VS Code extension host platform; the npm registry. |
| **Cost Structure** | Dominant cost is founder time (opportunity cost), not infrastructure — GitHub Actions CI on the free OSS tier covers build/test/release, and there is no paid hosting for v1. Time is the actual constraint, which argues for a tight v1 scope (fewer build targets done well over more done poorly). |

## Hypothesis Register

| ID | Hypothesis | Owning workshop |
| --- | --- | --- |
| H1 | Docs-as-code technical writers currently patch together Pandoc/CI scripts for multi-format publishing and would switch to a tool that validates structure *before* generation, not just converts. | BMC |
| H2 | OSS/indie technical authors are a distinct enough segment from docs-as-code writers to need a separate named platform app ("Author Kit" vs. "Publish Pro"), rather than one undifferentiated tool. | BMC |
| H3 | A Langium-based grammar (real parse-time validation, LSP diagnostics) is a meaningful enough differentiator over existing Markdown-to-X converters (Pandoc, markdown-it plugins) to justify building a new grammar rather than wrapping an existing converter. | BMC |
| H4 | DOCX, PDF, and EPUB are the right first three build targets — i.e., these three formats cover most of both segments' actual distribution needs for v1, with nothing more urgent missing. | BMC |
| H5 | At least one of the three planned paid layers (hosted service, pro features, enterprise support) has real demand from docs-as-code writers or OSS/indie authors once v1 has adoption — none has been validated with a customer yet. | BMC |
| H6 | v1 can be scoped so its capabilities extend cleanly into all three future paid layers (a template/theming seam for Pro features, a webhook-friendly CLI for the hosted service, config structure that generalizes to team-shared style guides for Enterprise) without over-building for revenue streams that don't yet have a customer. | BMC |
| H7 | VS Code Marketplace + npm are sufficient discovery channels for both segments at v1 — neither segment depends on a channel not yet covered (e.g. a package manager other than npm, a docs-site plugin ecosystem, a conference/community circuit). | BMC |
| H8 | Self-service + community support (GitHub Issues/Discussions), with no paid or high-touch tier, is enough relationship depth for both segments to adopt and stay — i.e. neither segment actually needs guided onboarding to succeed with the tool. | BMC |
| H9 | The founder's own maintenance time — not infrastructure, not funding — is the binding constraint on both Key Resources and Cost Structure at v1: nothing in scope requires resources beyond what a solo maintainer already has (Langium, VS Code APIs, npm, GitHub Actions' free OSS tier). | BMC |
| H10 | Maintaining three separate per-format generators (DOCX/PDF/EPUB) as ongoing Key Activities is sustainable for a solo maintainer — i.e. three build targets don't already exceed what one person can keep working through grammar changes without the project stalling. | BMC |
| H11 | The three planned third-party Key Partners (a DOCX-writing library, a PDF-rendering engine, an EPUB-packaging library) are stable and well-maintained enough to build on without becoming the project's single biggest maintenance risk. | BMC |
| H12 | Structural validation-before-generation (H3's differentiator claim) addresses the specific pains named in the VPC — silent cross-format breakage, broken EPUB links discovered post-publish — with enough severity/frequency that leading with it, rather than "one source, many formats," is the right value-prop framing. | VPC |
| H13 | OSS/indie authors will actually adopt with "no themes at v1, plain-but-clean default typography" meeting their Required gains — i.e. deferring theming (a founder-confirmed 2026-09-27 backlog decision, not itself in question) doesn't cost adoption once tested with real users. | VPC |
| H14 | Docs-as-code writers adopt without "custom templates/branding per format" at v1 — i.e. deferring it (founder-confirmed 2026-09-27 backlog decision) doesn't block this segment's adoption once tested. | VPC |

**H1–H14 cover all nine BMC blocks' and both VPCs' riskiest assumptions and are all unvalidated** —
no customer
interviews have happened yet, for the segments, the revenue plan, or the resourcing/channel/partner
assumptions. This canvas reflects founder direction on segments and revenue framing, not market
validation; per the methodology, update it the moment a real conversation with either segment
confirms or breaks any of these.
