const HEADING_PATTERN = /^(#{1,6}) (.*)$/;

export interface ParsedHeading {
    level: number;
    text: string;
}

export function parseHeading(raw: string): ParsedHeading {
    const match = HEADING_PATTERN.exec(raw);
    if (!match) {
        throw new Error(`Not a valid heading: ${raw}`);
    }
    return { level: match[1].length, text: match[2].trim() };
}

/**
 * GitHub-style heading anchor slug: lowercase, non-alphanumeric (other than spaces and
 * hyphens) stripped, spaces collapsed to hyphens. Per BR-4, colliding slugs are a
 * Structure Violation rather than being auto-disambiguated (no GitHub-style `-1` suffix).
 */
export function slugify(text: string): string {
    return text
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
}

export interface ParsedBlockQuoteLine {
    /** Number of leading `>` characters — nesting depth. */
    depth: number;
    /** The rest of the line after the `>` marker(s) and at most one following space. */
    content: string;
}

const BLOCKQUOTE_LINE_PATTERN = /^[ \t]{0,3}((?:>[ \t]*)+)(.*)$/;

export function parseBlockQuoteLine(raw: string): ParsedBlockQuoteLine {
    const match = BLOCKQUOTE_LINE_PATTERN.exec(raw);
    if (!match) {
        throw new Error(`Not a valid blockquote line: ${raw}`);
    }
    // Counts '>' characters directly rather than assuming they're packed together, so both
    // ">> nested" and "> > nested" (CommonMark's more common spaced style) count as depth 2.
    const depth = (match[1].match(/>/g) ?? []).length;
    return { depth, content: match[2] };
}

export interface ParsedListItemLine {
    /** Width of the leading whitespace — used to infer nesting depth against sibling items. */
    indent: number;
    ordered: boolean;
    /** The rest of the line after the marker and its following whitespace. */
    content: string;
}

const LIST_ITEM_LINE_PATTERN = /^([ \t]*)(?:([-*+])|(?:[0-9]{1,9})[.)])[ \t]+(.*)$/;

export function parseListItemLine(raw: string): ParsedListItemLine {
    const match = LIST_ITEM_LINE_PATTERN.exec(raw);
    if (!match) {
        throw new Error(`Not a valid list item line: ${raw}`);
    }
    return { indent: match[1].length, ordered: match[2] === undefined, content: match[3] };
}

export interface ParsedFencedCodeBlock {
    language: string | undefined;
    content: string;
}

const FENCED_CODE_BLOCK_PATTERN = /^(```|~~~)([^\n]*)\r?\n([\s\S]*?)\r?\n\1$/;

export function parseFencedCodeBlock(raw: string): ParsedFencedCodeBlock {
    const match = FENCED_CODE_BLOCK_PATTERN.exec(raw);
    if (!match) {
        throw new Error(`Not a valid fenced code block: ${raw}`);
    }
    const info = match[2].trim();
    return { language: info.length > 0 ? info : undefined, content: match[3] };
}
