# md-publisher

Build-time structural validation for `.mdpub` documents, right in the editor — live as you type,
not only when you build.

`.mdpub` is a Markdown-based format (headings, paragraphs, emphasis/strong, code spans, fenced
code blocks, blockquotes, lists, images, links, cross-references, thematic breaks — a practical
CommonMark superset) for docs-as-code writers and indie technical authors who publish the same
source to multiple targets (DOCX, PDF, EPUB, Web). This extension gives you the same structural
checks the `md-publisher` build pipeline runs, so a broken cross-reference or malformed document
never makes it into a build.

## What it checks

- **Broken cross-references** — a link like `[See Setup](#setup)` is flagged if no heading in the
  Publication resolves to `#setup`. Checked wherever it appears — a plain paragraph, inside a list
  item or blockquote, even nested inside emphasis.
- **Ambiguous anchors** — two headings that would produce the same anchor (e.g. two `## Getting
  Started` headings anywhere in the Publication) are flagged rather than silently resolved to
  "whichever one was found first."
- **Heading level skips** — heading levels may not jump (e.g. `#` straight to `###`, skipping
  `##`).

These are reported as `Structure Violation` diagnostics, shown inline with a squiggle under the
specific text at fault and listed in the Problems panel — updated as you type, with no file save
or build required.

## If the language server disconnects

If the extension's language server connection is ever lost, a status bar item reading
"⚠ Validation unavailable" appears — diagnostics may be stale or absent while it's shown, and are
never presented as if the Document were valid. It disappears again once the connection recovers.

## Requirements

VS Code 1.67.0 or newer. No other setup — the extension activates automatically when you open a
`.mdpub` file.

## What this extension does not do

Generation (producing DOCX/PDF/EPUB/Web output from a `.mdpub` Publication) is a separate part of
`md-publisher` — see [`md-publisher-cli`](https://www.npmjs.com/package/md-publisher-cli).

## More information

- [Project repository](https://github.com/dave-jackson-dev/md-publisher)
- [Report an issue](https://github.com/dave-jackson-dev/md-publisher/issues)
