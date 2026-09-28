grammar MdPublisher

// A .mdpub Document is a flat, ordered sequence of block-level elements. Each element captures
// its ENTIRE raw line (or, for front matter/fenced code, its entire raw multi-line span) as a
// single string — the grammar only decides *what kind* of block a line is, never what's inside
// it. Inline content (emphasis, links, cross-references, code spans, ...) is parsed separately,
// by md-publisher-inline.ts, from each block's raw text. This block/inline split mirrors
// CommonMark's own two-phase algorithm (the spec itself parses blocks first, inlines second) and
// is what makes a Chevrotain/Langium grammar — fundamentally a single-pass lexer plus a
// context-free parser, not indentation- or two-phase-aware on its own — tractable at all for a
// CommonMark-shaped language. See Sprint 2a's plan
// (docs/planning/md-publisher/iterations/01/10-sprint-2-grammar-plan.md) for the full rationale
// and the "practical superset, not full spec" scope this implements.
//
// Nesting (list items containing sub-lists, blockquotes containing lists, multi-paragraph list
// items, ...) is NOT represented here as a recursive grammar tree. BlockQuoteLine and
// ListItemLine are still flat, one-per-physical-line elements, same as every other block type —
// packages/publishing's compileChapter groups consecutive lines into actual nested structures
// by inspecting each line's own indent/marker-depth. This keeps the grammar's lexer-priority
// reasoning identical to every other block type (see the terminal ordering note below) instead
// of needing a custom indentation-aware token builder.
entry Document:
    elements+=DocumentElement*;

DocumentElement:
    FrontMatter | FencedCodeBlock | Heading | ThematicBreak | BlockQuoteLine | ListItemLine | ParagraphBreak | TextLine;

// YAML front matter fenced by `---` lines. Per 08-mvp-plan.md's Finding 3, front matter is only
// ever *meant* to be the Document's first element (BR-2, which validated that, is retired) — but
// the grammar still recognizes a well-formed `---`-fenced block with real content wherever it
// occurs, same as Sprint 1a. Restricting recognition to true document-start would need a custom,
// position-aware token builder (Langium's lexer has no built-in "only at offset 0" terminal
// concept); given BR-2 no longer needs to *detect* a misplaced block, that engineering cost isn't
// worth it for this Iteration's scope. Documented consequence: a `---`-fenced span that happens to
// contain YAML-key:value-shaped lines, occurring later in a Document, is still read as an (unused)
// FrontMatter node rather than a thematic break followed by ordinary paragraph text — a known,
// intentionally accepted edge case, not a bug to chase down here.
FrontMatter:
    raw=FRONT_MATTER_BLOCK;

// A fenced code block (``` or ~~~), info string and all, captured verbatim start to end — code
// block content is never inline-parsed, per CommonMark.
FencedCodeBlock:
    raw=FENCED_CODE_BLOCK;

// An ATX heading line, e.g. "## Setup". Deliberately NOT inline-parsed (no emphasis/links inside
// heading text) — a scope-narrowing simplification kept from Sprint 1a, not a regression: heading
// text has always been used as a plain string (for cross-reference anchor slugs), and CommonMark
// technically allowing inline formatting there isn't worth the added complexity for this
// Iteration's practical-superset scope.
Heading:
    raw=HEADING_LINE;

// A thematic break: 3+ of the same "-", "*", or "_" character (with optional interior
// whitespace) alone on a line.
ThematicBreak:
    raw=THEMATIC_BREAK_LINE;

// One line of a blockquote: 1+ leading ">" characters (nesting depth) plus the rest of the line.
// Consecutive BlockQuoteLine elements with no ParagraphBreak between them belong to the same
// logical blockquote — grouped in packages/publishing's compileChapter, not here.
BlockQuoteLine:
    raw=BLOCKQUOTE_LINE;

// One line of a list item: leading indent (nesting depth) + a bullet ("-"/"*"/"+") or ordinal
// ("1." / "1)") marker + the rest of the line. Continuation lines of a multi-line item are just
// further TextLine elements at matching indent — again grouped in compileChapter.
ListItemLine:
    raw=LIST_ITEM_LINE;

// A blank line: two or more consecutive line breaks, ending the current paragraph/list-item/
// blockquote run.
ParagraphBreak:
    raw=BLANK_LINE;

// Any other non-blank line: plain paragraph text, inline-parsed from its raw content by
// md-publisher-inline.ts.
TextLine:
    raw=TEXT_LINE;

// Terminal order matters here, not just for readability: Chevrotain's lexer picks the longest
// match at each position and only falls back to declaration order on an exact tie.
// FRONT_MATTER_BLOCK and FENCED_CODE_BLOCK never tie with anything (they span multiple lines, so
// their match is always longer than any single-line terminal's). HEADING_LINE,
// THEMATIC_BREAK_LINE, BLOCKQUOTE_LINE, and LIST_ITEM_LINE all produce a match exactly as long as
// TEXT_LINE would for the same line — an exact tie broken by declaring them first — *except*
// against each other, where a real ambiguity exists ("- - -" matches both THEMATIC_BREAK_LINE and
// LIST_ITEM_LINE at equal length) and is resolved the same way: THEMATIC_BREAK_LINE is declared
// before LIST_ITEM_LINE, matching CommonMark's own real behavior (a "- - -" line is a thematic
// break, not a 3-item list).
terminal FRONT_MATTER_BLOCK: /---\r?\n[\s\S]+?\r?\n---/;
terminal FENCED_CODE_BLOCK: /(?:```[^\n]*\r?\n[\s\S]*?\r?\n```|~~~[^\n]*\r?\n[\s\S]*?\r?\n~~~)/;
terminal HEADING_LINE: /#{1,6} [^\n]*/;
terminal THEMATIC_BREAK_LINE: /(?:-[ \t]*){3,}|(?:\*[ \t]*){3,}|(?:_[ \t]*){3,}/;
terminal BLOCKQUOTE_LINE: /[ \t]{0,3}>+[ \t]?[^\n]*/;
terminal LIST_ITEM_LINE: /[ \t]*(?:[-*+]|[0-9]{1,9}[.)])[ \t]+[^\n]*/;
terminal BLANK_LINE: /(?:\r?\n){2,}/;
terminal TEXT_LINE: /[^\n]+/;

// A single line break (not part of a blank line) never carries information of its own anymore —
// hard-vs-soft line break is decided by inspecting a TextLine's own trailing content (2+ trailing
// spaces or a trailing backslash) when grouping lines into paragraphs, not by which terminal
// matched the newline — so it can go back to being silently discarded here.
hidden terminal LINE_BREAK: /\r?\n/;
