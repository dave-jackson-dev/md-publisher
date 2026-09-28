# Examples

## `user-guide/` — a real, generated Publication

A minimal but real four-chapter Publication, checked in together with its actual generated
output, so you can see what `md-publisher-cli generate` produces without having to build it
yourself first.

```
examples/user-guide/
  01-introduction.mdpub       front matter with `toc: true` (the EPUB table-of-contents source)
  02-setup.mdpub
  03-advanced-topics.mdpub
  04-syntax-reference.mdpub   every construct md-publisher supports, syntax and output side by side
  diagram.png                  a placeholder image, referenced by 04-syntax-reference.mdpub
  dist/                        generated output, committed as-is — see below
    user-guide.docx
    user-guide.pdf
    user-guide.epub
    user-guide/                 the Web target: index.html + one page per chapter + styles.css
```

`04-syntax-reference.mdpub` is the one to read for a complete tour of the grammar: headings,
paragraphs (soft wraps, hard breaks), emphasis/strong, code spans, fenced code blocks, blockquotes
(nested), lists (ordered/unordered, nested), images, links, cross-references, and thematic breaks
— each shown as a fenced-code-block "Syntax:" example (escaped with a `~~~` fence where it needs
to show a literal ` ``` `) immediately followed by that same construct rendered live.

Chapter order is filename-alphabetical (`01-`, `02-`, `03-` prefixes) — see
[packages/publishing/README.md](../packages/publishing/README.md) for why. Each chapter links to
the others by heading anchor (`[Setup](#setup)`, etc.); `01-introduction.mdpub`'s front matter is
the one chapter marked `toc: true`, which EPUB generation requires (BR-6).

### Reproducing it yourself

From this directory:

```bash
node ../../packages/cli/bin/cli.js generate . --targets docx,pdf,web,epub
```

This is the exact command that produced `dist/`. It will silently overwrite the committed output
with a freshly generated copy (BR-5) — diff `dist/` afterward if you want to confirm nothing
changed. Requires the workspace to be built first (`npm install && npm run langium:generate &&
npm run build` from the repo root — see the root [README](../README.md)).

Running it also creates a local `examples/user-guide/.gitignore` (Feature 10/BR-8 — see
[packages/cli/README.md](../packages/cli/README.md)). **Delete that file before running `git add`
here** — this is the one directory in the repo where generated output is deliberately committed,
and that auto-created file, being more deeply nested, would otherwise override the root
`.gitignore`'s exception for it and silently hide `dist/`'s contents from git. See the comment
above `examples/user-guide/.gitignore` in the root `.gitignore` for the full explanation.

### What to look at, per format

- **Web** (`dist/user-guide/index.html`) — open it in a browser. Every chapter link and every
  in-text cross-reference (e.g. "Setup" in the Introduction) is a real `<a href>` to the right
  file and heading anchor.
- **DOCX** (`dist/user-guide.docx`) — open in Word (or any compatible reader). Headings carry a
  Word bookmark; cross-references are real internal hyperlinks — Ctrl/Cmd-click "Setup" in the
  Introduction and it jumps to the Setup heading, in the same document.
- **EPUB** (`dist/user-guide.epub`) — open in any EPUB reader (or unzip it — it's a real EPUB3
  zip archive: `OEBPS/content.opf`, `OEBPS/nav.xhtml`, one `OEBPS/chapterN.xhtml` per chapter).
  The table of contents lists all three chapters; cross-references link across chapter files
  correctly regardless of Publication size (Feature 7).
- **PDF** (`dist/user-guide.pdf`) — one page per chapter, headings sized by level. Cross-reference
  text renders (e.g. "See Setup") but isn't a clickable internal link — see
  [packages/publishing/README.md](../packages/publishing/README.md) for why PDF is the one target
  without internal navigation.

### Seeing a Structure Violation for yourself

Break something and re-run the command above to see generation refuse to produce any output at
all:

```bash
sed -i 's/#setup/#setpu/' 01-introduction.mdpub   # the cross-reference now points at a heading that doesn't exist
node ../../packages/cli/bin/cli.js generate . --targets docx,pdf,web,epub
git checkout 01-introduction.mdpub                 # undo the break
```

You should see:

```
✗ Structure Violation in 01-introduction.mdpub
  Heading "#setpu" not found in this Publication
No Output Artifact was produced. Fix the violation and run again.
```

— and no artifact produced for any target, not just the one chapter: the whole Generation refuses
(BR-5). Only BR-6's Build-Target Violation (EPUB's missing `toc: true` marker) is per-target — see
[packages/cli/README.md](../packages/cli/README.md).
