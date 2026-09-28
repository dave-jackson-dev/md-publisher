# Change Log

All notable changes to the `md-publisher` VS Code extension are documented here.

## [Unreleased]

### Added

- Real `.mdpub` grammar covering a practical CommonMark superset (front matter, headings,
  paragraphs, emphasis/strong, code spans, fenced code blocks, blockquotes, lists, images, links,
  cross-references, thematic breaks), replacing the Langium generator's placeholder.
- Structure Violation diagnostics for broken cross-references (including inside list items,
  blockquotes, and emphasis), ambiguous anchors, and heading-level skips.
- A status bar warning when the language server disconnects, so diagnostics are never presented as
  current when they might be stale or absent.
- `md-publisher: Open File...` command (Command Palette) to open a `.mdpub`/`.md` file with the
  `md-publisher` language mode explicitly set.
- `md-publisher: Publish` command (Explorer folder context menu) to generate a Publication's DOCX,
  PDF, Web, and/or EPUB output into a `dist` subfolder, reusing the same Structure Violation and
  `.gitignore` handling as the CLI's `generate` command.

### Changed

- Front-matter-position is no longer a Structure Violation (front matter is recognized only at a
  Document's start now that thematic breaks exist, so a misplaced block is never mistaken for one).
