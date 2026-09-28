grammar MdPublisher

// A .mdpub Document is a flat, ordered sequence of elements: an optional front-matter
// block, ATX headings, cross-reference links, and everything else as plain text runs.
// Markdown's inline content doesn't decompose cleanly into a traditional nested grammar,
// so this stays deliberately flat — structure that BR-1..BR-4 care about (front-matter
// position, heading order, cross-reference targets) is still fully recoverable from
// document order, and each recognized construct keeps its own CST range for precise
// diagnostics.
entry Document:
    elements+=DocumentElement*;

DocumentElement:
    FrontMatter | Heading | CrossReference | PlainRun;

// YAML front matter fenced by `---` lines. Recognized wherever it appears in the
// token stream (not only at the top) so BR-2 can flag a misplaced block instead of the
// parser simply failing to see it.
FrontMatter:
    raw=FRONT_MATTER_BLOCK;

// An ATX heading line, e.g. "## Setup". Level and text are derived from `raw` at
// validation time rather than split into grammar properties, since splitting them
// would require terminals shorter than the whole-line match and lose the tie-break
// against TEXT_RUN (see terminal ordering note below).
Heading:
    raw=HEADING_LINE;

// A Markdown inline link whose target is a same-Publication anchor, e.g.
// "[See Setup](#setup)". Text/anchor are likewise derived from `raw` in code.
CrossReference:
    raw=CROSS_REF;

// Everything else: prose, external links, malformed/incomplete bracket syntax.
PlainRun:
    raw=TEXT_RUN | raw=STRAY_BRACKET;

// Terminal order matters here, not just for readability: Chevrotain's lexer picks the
// longest match at each position and only falls back to declaration order on an exact
// tie. FRONT_MATTER_BLOCK and CROSS_REF never tie with TEXT_RUN (their matches are
// either strictly longer or start at a character TEXT_RUN excludes), but HEADING_LINE
// and TEXT_RUN produce byte-identical matches for a plain heading line (TEXT_RUN's
// character class doesn't need to exclude '#'), so HEADING_LINE must be declared first.
terminal FRONT_MATTER_BLOCK: /---\r?\n[\s\S]*?\r?\n---/;
terminal HEADING_LINE: /#{1,6} [^\n]*/;
terminal CROSS_REF: /\[[^\]\n]+\]\(#[^)\n]+\)/;
// Excludes '[' so it always yields to CROSS_REF/STRAY_BRACKET at a bracket position,
// and excludes '\n' so it never spans the hidden NEWLINE terminal below.
terminal TEXT_RUN: /[^\n\[]+/;
// Fallback for a '[' that isn't part of a valid cross-reference (e.g. unclosed, or a
// markdown link to something other than a same-Publication anchor).
terminal STRAY_BRACKET: /\[/;

hidden terminal NEWLINE: /\r?\n/;
