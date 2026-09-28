# md-publisher

Build-time structural validation for `.mdpub` documents, right in the editor.

`.mdpub` is a Markdown-based format for docs-as-code writers and indie technical authors who
publish the same source to multiple targets (DOCX, PDF, EPUB, Web). This extension gives you the
same structural checks the `md-publisher` build pipeline runs, live as you type, so a broken
cross-reference or malformed document never makes it into a build.

## What it checks

- **Broken cross-references** — a link like `[See Setup](#setup)` is flagged if no heading in the
  Publication resolves to `#setup`.
- **Ambiguous anchors** — two headings that would produce the same anchor (e.g. two `## Getting
  Started` headings anywhere in the Publication) are flagged rather than silently resolved to
  "whichever one was found first."
- **Front matter position** — front matter must appear before any content in a Document.
- **Heading level skips** — heading levels may not jump (e.g. `#` straight to `###`, skipping
  `##`).

All four are reported as `Structure Violation` diagnostics, shown inline with a squiggle under the
specific text at fault and listed in the Problems panel.

## Requirements

VS Code 1.67.0 or newer. No other setup — the extension activates automatically when you open a
`.mdpub` file.

## What this extension does not do (yet)

Generation (producing DOCX/PDF/EPUB/Web output from a `.mdpub` Publication) is a separate,
in-progress part of `md-publisher` and isn't wired into this extension yet.

## More information

- [Project repository](https://github.com/dave-jackson-dev/md-publisher)
- [Report an issue](https://github.com/dave-jackson-dev/md-publisher/issues)
