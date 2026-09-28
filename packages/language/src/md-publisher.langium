grammar MdPublisher

// A .mdpub Document is a flat, ordered sequence of elements: an optional front-matter
// block, ATX headings, cross-reference links, paragraph breaks, and everything else as
// plain text runs. Markdown's inline content doesn't decompose cleanly into a traditional
// nested grammar, so this stays deliberately flat — structure that BR-1..BR-4 care about
// (front-matter position, heading order, cross-reference targets) is still fully
// recoverable from document order, and each recognized construct keeps its own CST range
// for precise diagnostics.
entry Document:
    elements+=DocumentElement*;

DocumentElement:
    FrontMatter | Heading | CrossReference | ParagraphBreak | PlainRun;

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

// A blank line: two or more consecutive line breaks, ending the current paragraph.
// Distinct from a single line break (BLANK_LINE requires 2+, so it never matches where
// only a SOFT_BREAK does — see terminal definitions) — two adjacent source lines with no
// blank line between them are still the same paragraph, soft-wrapped.
ParagraphBreak:
    raw=BLANK_LINE;

// Everything else: prose, external links, malformed/incomplete bracket syntax, and a
// single line break within a paragraph (SOFT_BREAK) — packages/publishing's compileChapter
// treats a SOFT_BREAK PlainRun as a joining space between the runs around it, matching
// CommonMark's soft-break-as-space rule, rather than gluing adjacent lines together.
PlainRun:
    raw=TEXT_RUN | raw=STRAY_BRACKET | raw=SOFT_BREAK;

// Terminal order matters here, not just for readability: Chevrotain's lexer picks the
// longest match at each position and only falls back to declaration order on an exact
// tie. FRONT_MATTER_BLOCK and CROSS_REF never tie with TEXT_RUN (their matches are
// either strictly longer or start at a character TEXT_RUN excludes), but HEADING_LINE
// and TEXT_RUN produce byte-identical matches for a plain heading line (TEXT_RUN's
// character class doesn't need to exclude '#'), so HEADING_LINE must be declared first.
// BLANK_LINE and SOFT_BREAK never tie with each other or TEXT_RUN: BLANK_LINE's `{2,}`
// requires strictly more characters than SOFT_BREAK can match at the same position, and
// TEXT_RUN excludes '\n' entirely so it never competes with either.
terminal FRONT_MATTER_BLOCK: /---\r?\n[\s\S]*?\r?\n---/;
terminal HEADING_LINE: /#{1,6} [^\n]*/;
terminal CROSS_REF: /\[[^\]\n]+\]\(#[^)\n]+\)/;
terminal BLANK_LINE: /(?:\r?\n){2,}/;
// Excludes '[' so it always yields to CROSS_REF/STRAY_BRACKET at a bracket position,
// and excludes '\n' so it never spans a line break.
terminal TEXT_RUN: /[^\n\[]+/;
// Fallback for a '[' that isn't part of a valid cross-reference (e.g. unclosed, or a
// markdown link to something other than a same-Publication anchor).
terminal STRAY_BRACKET: /\[/;
// A single line break not part of a blank line — see ParagraphBreak/PlainRun above.
terminal SOFT_BREAK: /\r?\n/;
