# Three Amigos (Specification by Example) — md-publisher, Iteration 01

**Status: DRAFT — facilitated, not yet founder-accepted (`three-amigos:accept` is a separate
step).**

Sources: `04-domain-storytelling.md` (example scenarios, business rules) and
`05-architecture-design.md` (dependency map — Features below are sequenced Story 1 → Story 2 →
Story 3, matching the confirmed dependency order). Every scenario traces to a named business rule
or the domain story's own narrative — no invented behavior.

## ⚠️ Methodology-fit note: Zero-Trust scenarios, consistent with H15

The methodology requires at least one `@zero-trust` "I CANNOT" scenario per "I CAN" story. **This
repeats, downstream, the exact gap Workshop 3 already surfaced and the founder already confirmed
(H15): v1 has no runtime RBAC boundary** — there is no unauthorized role to deny, so there is no
true Zero-Trust scenario to write for any Feature below. Every Feature states this explicitly (`No
Zero-Trust scenario — see H15`) rather than either fabricating a scenario that tests nothing real
or silently omitting the requirement. This is not a new decision being made here — it's the same
one applying downstream, not re-litigated. **Explicitly avoiding the anti-pattern the facilitate
step itself names:** a scenario cannot be tagged `@zero-trust` just to hit a number when nothing
behind it is actually a security boundary — that produces exactly the "0 of 136 actually tagged"
failure the step warns about, just inverted (fabricated rather than mis-tagged).

## Scope: 10 Features, not 11

Story Map's Walking Skeleton ("run one CLI command to parse a trivial file and generate a one-page
PDF") is a minimal instance of Feature 5 below, not a distinct capability — it introduces no "I
CAN" vocabulary Feature 5 doesn't already cover. Writing it as its own Feature would be a
redundant specification, not a missing one. Not counted as a floating/uncovered story: it's
subsumed, explicitly.

---

## Feature 1 — Install the VS Code Extension

```gherkin
Feature: Install the VS Code Extension

  As a Docs Writer
  I CAN Install the VS Code Extension from the Marketplace
  So that, I get validation in the editor I already use

  Scenario: Installing the extension from the Marketplace
    Given I have VS Code 1.67.0 or newer
    When I install "md-publisher" from the VS Code Marketplace
    Then the extension activates automatically when I open a .mdpub file

  Scenario: Reinstalling over an existing installation
    Given I already have the extension installed
    When I install "md-publisher" again from the Marketplace
    Then the extension updates to the latest version rather than duplicating the install

  Scenario: VS Code version below the minimum supported
    Given I have VS Code 1.66.0
    When I attempt to install "md-publisher"
    Then the install is blocked
      And I see a message naming 1.67.0 as the minimum required version
```

*No Zero-Trust scenario — see H15. Installation is a local action with no runtime role boundary.*

## Feature 2 — Install the CLI via npm

```gherkin
Feature: Install the CLI via npm

  As an Indie Author
  I CAN Install the CLI via npm
  So that, I can generate output without needing VS Code

  Scenario: Installing the CLI globally
    Given I have Node.js 20.10.0 or newer
    When I run "npm install -g md-publisher-cli"
    Then the "md-publisher-cli" command is available on my PATH

  Scenario: Reinstalling over an existing installation
    Given I already have "md-publisher-cli" installed
    When I run "npm install -g md-publisher-cli" again
    Then the CLI updates to the latest version rather than duplicating the install

  Scenario: Node.js version below the minimum supported
    Given I have Node.js 18.0.0
    When I attempt to install "md-publisher-cli"
    Then npm reports the engines requirement is not satisfied
      And the install does not proceed
```

*No Zero-Trust scenario — see H15.*

## Feature 3 — Have Broken Cross-References Flagged at Build Time

```gherkin
Feature: Have Broken Cross-References Flagged at Build Time

  As a Docs Writer
  I CAN Have Broken Cross-References Flagged at Build Time
  So that, a build fails loudly instead of shipping a broken PDF table of contents

  Scenario: A Publication with only valid cross-references
    Given a Document "guide.mdpub" with a heading "## Setup"
      And a Cross-Reference "[See Setup](#setup)" elsewhere in the same Publication
    When the GrammarEngine parses the Publication
    Then no Structure Violation is raised

  Scenario: A Cross-Reference to a nonexistent heading
    Given a Document "guide.mdpub" containing a Cross-Reference "[See Setup](#setup)"
      And no heading named "Setup" exists anywhere in the Publication
    When the GrammarEngine parses the Publication
    Then a Structure Violation is raised
      And the Diagnostic names "#setup" as the missing target

  Scenario: Two headings producing the same cross-reference anchor
    Given "intro.mdpub" and "chapter-1.mdpub" each contain a heading "## Getting Started"
      And both headings resolve to the anchor "#getting-started"
    When the GrammarEngine parses the Publication
    Then a Structure Violation is raised for an ambiguous target
      And the build does not silently pick the first matching heading
```

*No Zero-Trust scenario — see H15.*

## Feature 4 — Have Broken Internal Links Flagged at Build Time

```gherkin
Feature: Have Broken Internal Links Flagged at Build Time

  As an Indie Author
  I CAN Have Broken Internal Links Flagged at Build Time
  So that, I never hand a reader an EPUB with a dead link

  Scenario: A Publication with front matter placed after content
    Given a Document "chapter-1.mdpub" whose "title: Chapter One" front matter appears after its
      first paragraph of content, instead of at the top of the file
    When the GrammarEngine parses the Document
    Then a Structure Violation is raised

  Scenario: A Publication with a heading level skip
    Given a Document "chapter-2.mdpub" whose heading structure goes from "# Chapter Two" directly
      to "### Background", skipping the H2 level
    When the GrammarEngine parses the Document
    Then a Structure Violation is raised naming the skipped level
```

*Uses the same GrammarEngine mechanism as Feature 3 (Domain Storytelling's shared-flow note) — not
re-deriving the cross-reference scenarios already covered there. No Zero-Trust scenario — see
H15.*

## Feature 5 — Generate DOCX, PDF, and Web Output from One Source with One Command

```gherkin
Feature: Generate DOCX, PDF, and Web Output from One Source with One Command

  As a Docs Writer
  I CAN Generate DOCX, PDF, and Web Output from One Source with One Command
  So that, I never maintain three separate build pipelines

  Scenario: Generating all three Build Targets from a valid Publication
    Given a Publication "user-guide" with 3 Documents and no Structure Violation
    When I run "md-publisher-cli generate user-guide --targets docx,pdf,web"
    Then an OutputArtifact is produced at "dist/user-guide.docx", "dist/user-guide.pdf", and
      "dist/user-guide/" for the three Build Targets

  Scenario: Requesting only a subset of Build Targets
    Given a Publication "user-guide" with no Structure Violation
    When I run "md-publisher-cli generate user-guide --targets pdf"
    Then only "dist/user-guide.pdf" is produced
      And no Docx or Web OutputArtifact is created or modified

  Scenario: Generation refused on an unresolved Structure Violation
    Given a Publication "user-guide" with an unresolved Structure Violation in "chapter-2.mdpub"
    When I run "md-publisher-cli generate user-guide --targets docx,pdf,web"
    Then the Generator refuses to produce any OutputArtifact
      And the Structure Violation in "chapter-2.mdpub" is reported instead

  Scenario: Regenerating over an existing OutputArtifact
    Given "dist/user-guide.pdf" already exists from a previous Generation
    When I run "md-publisher-cli generate user-guide --targets pdf" again
    Then "dist/user-guide.pdf" is silently overwritten with the current Publication content
      And no confirmation prompt is shown
```

*No Zero-Trust scenario — see H15.*

## Feature 6 — Generate EPUB and PDF from One Source with One Command

```gherkin
Feature: Generate EPUB and PDF from One Source with One Command

  As an Indie Author
  I CAN Generate EPUB and PDF from One Source with One Command
  So that, I never touch Word, InDesign, or LaTeX

  Scenario: Generating both Build Targets from a valid Publication
    Given a Publication "field-notes" with 5 chapters and no Structure Violation
    When I run "md-publisher-cli generate field-notes --targets epub,pdf"
    Then "dist/field-notes.epub" and "dist/field-notes.pdf" are both produced

  Scenario: EPUB-specific structural requirement missing
    Given a Publication "field-notes" with no Structure Violation, but no chapter is marked as
      the table-of-contents source
    When I run "md-publisher-cli generate field-notes --targets epub,pdf"
    Then a BuildTargetViolation is raised for Epub, distinct from a Structure Violation
      And "dist/field-notes.pdf" is still produced, unaffected by the Epub failure

  Scenario: Generation refused on an unresolved Structure Violation
    Given a Publication "field-notes" with an unresolved Structure Violation
    When I run "md-publisher-cli generate field-notes --targets epub,pdf"
    Then the Generator refuses to produce any OutputArtifact
```

*No Zero-Trust scenario — see H15.*

## Feature 7 — Open the Generated EPUB and Navigate It Without a Broken Link

```gherkin
Feature: Open the Generated EPUB and Navigate It Without a Broken Link

  As an Indie Author
  I CAN Open the Generated EPUB and Navigate It Without a Broken Link
  So that, a reader's experience is never undermined by the export step

  Scenario: Navigating a small EPUB
    Given "dist/field-notes.epub", generated from a Publication with 3 chapters
    When a reader opens the EPUB and follows its table of contents
    Then every link resolves to the correct chapter

  Scenario: Navigating a large EPUB
    Given "dist/field-notes.epub", generated from a Publication with 20 chapters
    When a reader opens the EPUB and follows its table of contents
    Then every link resolves to the correct chapter, at the same reliability as the 3-chapter case
```

*Broken-link error handling is already specified in Feature 4 (caught at build time, before an
EPUB is ever produced) — not repeated here. No Zero-Trust scenario — see H15.*

## Feature 8 — See Structural Errors Highlighted as I Type

```gherkin
Feature: See Structural Errors Highlighted as I Type

  As a Docs Writer
  I CAN See Structural Errors Highlighted as I Type
  So that, I catch a broken cross-reference before I even try to build

  Scenario: Typing a broken cross-reference
    Given I am editing "guide.mdpub" in the Editor
    When I type "[See Setup](#setup)" and no heading named "Setup" exists in the Publication
    Then a Diagnostic appears inline, without running a build

  Scenario: Fixing a flagged error live
    Given "guide.mdpub" shows a Diagnostic for the Cross-Reference "[See Setup](#setup)"
    When I add a "## Setup" heading matching the Cross-Reference
    Then the Diagnostic disappears without requiring a file save

  Scenario: The language server becomes unavailable
    Given I am editing a Document with live validation active
    When the language server connection is lost
    Then the Editor shows an explicit "validation unavailable" state
      And does not silently show a stale or absent Diagnostic as if the Document were valid
```

*No Zero-Trust scenario — see H15.*

## Feature 9 — See Structural Errors Highlighted as I Type (Indie Author)

```gherkin
Feature: See Structural Errors Highlighted as I Type

  As an Indie Author
  I CAN See Structural Errors Highlighted as I Type
  So that, I catch a malformed chapter before I even try to build

  Scenario: Typing a structural error
    Given I am editing "chapter-2.mdpub" in the Editor
    When I change "# Chapter Two" ... "## Background" to "# Chapter Two" ... "### Background",
      skipping the H2 level
    Then a Diagnostic appears inline, without running a build
```

*Mechanically identical to Feature 8 (same GrammarEngine, same Editor, per Domain Storytelling's
shared-flow note) — the fix-live and language-server-unavailable scenarios from Feature 8 apply
here unchanged and are not duplicated. No Zero-Trust scenario — see H15.*

## Feature 10 — Review Only the Prose Diff of a Pull Request

```gherkin
Feature: Review Only the Prose Diff of a Pull Request

  As a Docs Writer
  I CAN Review Only the Prose Diff of a Pull Request
  So that, I am not forced to review generated build artifacts to approve a content change

  Scenario: A Pull Request that changes only Document content
    Given Pull Request #42 changes only "chapter-2.mdpub"
    When a Reviewer opens Pull Request #42
    Then the ProseDiff shows only the changed content of "chapter-2.mdpub"
      And no OutputArtifact appears in the diff

  Scenario: Source control configured to exclude generated output
    Given the Publication's ".gitignore" excludes the "dist/" directory
    When a Docs Writer runs "md-publisher-cli generate user-guide" locally
    Then "dist/user-guide.pdf" is not staged for commit
      And BR-8 (Output Artifacts are never committed to source) holds structurally, not just by
        the Docs Writer remembering not to commit them

  Scenario: Continuous Integration generation fails
    Given Pull Request #43 triggers ContinuousIntegration
    When ContinuousIntegration runs "md-publisher-cli generate user-guide" and a Structure
      Violation is found in "chapter-3.mdpub"
    Then Pull Request #43 is marked Failing
      And the Reviewer is not expected to review further until it is fixed
```

*No Zero-Trust scenario — see H15.*

## New hypothesis opened by this workshop

None — every scenario traces to a business rule or narrative already established in Domain
Storytelling; nothing here is a new unvalidated claim about customers or markets.
