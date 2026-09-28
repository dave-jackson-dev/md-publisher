/**
 * Inline-content parsing, the second phase of the block/inline split described in
 * md-publisher.langium's top comment. Operates on a block's already-extracted raw text (a single
 * TextLine/BlockQuoteLine/ListItemLine's content, or several joined together into one paragraph —
 * see packages/publishing's compileChapter) rather than on Langium's own CST, so offsets in the
 * returned nodes are relative to the string passed in, not the Document. Callers needing an
 * absolute position (the validator, for diagnostics) add the containing block's own start offset.
 *
 * This is a deliberately simplified scanner, not a full CommonMark delimiter-stack/flanking-rule
 * implementation — see Sprint 2a's plan (docs/planning/md-publisher/iterations/01/
 * 10-sprint-2-grammar-plan.md) for the "practical superset, not full spec" scope this fills. In
 * particular: emphasis/strong matching takes the *first* plausible closing delimiter rather than
 * applying CommonMark's flanking rules, and a delimiter run of 3+ characters is treated as
 * strong (first 2) plus a literal remainder, not as nested emphasis+strong.
 */

export type InlineNode =
    | { type: 'text'; value: string; start: number; end: number }
    | { type: 'emphasis'; children: InlineNode[]; start: number; end: number }
    | { type: 'strong'; children: InlineNode[]; start: number; end: number }
    | { type: 'code'; value: string; start: number; end: number }
    | { type: 'crossReference'; text: string; anchor: string; start: number; end: number }
    | { type: 'link'; text: string; url: string; start: number; end: number }
    | { type: 'image'; alt: string; url: string; start: number; end: number }
    | { type: 'hardBreak'; start: number; end: number };

const IMAGE_PATTERN = /^!\[([^\]]*)\]\(([^)]+)\)/;
const LINK_PATTERN = /^\[([^\]]+)\]\(([^)]+)\)/;

export function parseInline(raw: string): InlineNode[] {
    const nodes: InlineNode[] = [];
    let position = 0;
    let textStart = 0;

    const flushText = (end: number) => {
        if (end > textStart) {
            nodes.push({ type: 'text', value: raw.slice(textStart, end), start: textStart, end });
        }
    };

    while (position < raw.length) {
        const ch = raw[position];

        if (ch === '\n') {
            // Only present because a caller (compileChapter) deliberately inserted it to mark a
            // hard line break between two joined lines — a raw single-line block never contains
            // one on its own.
            flushText(position);
            nodes.push({ type: 'hardBreak', start: position, end: position + 1 });
            position += 1;
            textStart = position;
            continue;
        }

        if (ch === '!' && raw[position + 1] === '[') {
            const match = IMAGE_PATTERN.exec(raw.slice(position));
            if (match) {
                flushText(position);
                const end = position + match[0].length;
                nodes.push({ type: 'image', alt: match[1], url: match[2], start: position, end });
                position = end;
                textStart = position;
                continue;
            }
        }

        if (ch === '[') {
            const match = LINK_PATTERN.exec(raw.slice(position));
            if (match) {
                flushText(position);
                const end = position + match[0].length;
                const [text, url] = [match[1], match[2]];
                if (url.startsWith('#')) {
                    nodes.push({ type: 'crossReference', text, anchor: url.slice(1).toLowerCase(), start: position, end });
                } else {
                    nodes.push({ type: 'link', text, url, start: position, end });
                }
                position = end;
                textStart = position;
                continue;
            }
        }

        if (ch === '`') {
            const tickRun = matchRun(raw, position, '`');
            const closeAt = raw.indexOf('`'.repeat(tickRun), position + tickRun);
            if (closeAt !== -1) {
                flushText(position);
                let content = raw.slice(position + tickRun, closeAt);
                // CommonMark: a single leading and trailing space is stripped if the content isn't
                // all whitespace, so `` `code` `` and `` ` `` (a literal backtick) both work.
                if (content.startsWith(' ') && content.endsWith(' ') && content.trim().length > 0) {
                    content = content.slice(1, -1);
                }
                const end = closeAt + tickRun;
                nodes.push({ type: 'code', value: content, start: position, end });
                position = end;
                textStart = position;
                continue;
            }
        }

        if (ch === '*' || ch === '_') {
            const runLength = Math.min(matchRun(raw, position, ch), 2);
            const delimiter = ch.repeat(runLength);
            const searchFrom = position + runLength;
            const closeAt = raw.indexOf(delimiter, searchFrom);
            if (closeAt !== -1 && closeAt > searchFrom) {
                flushText(position);
                const innerRaw = raw.slice(searchFrom, closeAt);
                const children = parseInline(innerRaw).map(node => shiftNode(node, searchFrom));
                const end = closeAt + runLength;
                nodes.push({ type: runLength === 2 ? 'strong' : 'emphasis', children, start: position, end });
                position = end;
                textStart = position;
                continue;
            }
        }

        position += 1;
    }

    flushText(raw.length);
    return nodes;
}

function matchRun(raw: string, start: number, char: string): number {
    let end = start;
    while (raw[end] === char) {
        end += 1;
    }
    return end - start;
}

function shiftNode(node: InlineNode, offset: number): InlineNode {
    const shifted = { ...node, start: node.start + offset, end: node.end + offset };
    if (shifted.type === 'emphasis' || shifted.type === 'strong') {
        shifted.children = shifted.children.map(child => shiftNode(child, offset));
    }
    return shifted;
}

/** Every crossReference node anywhere in the tree (including nested inside emphasis/strong). */
export function collectCrossReferences(nodes: InlineNode[]): Array<Extract<InlineNode, { type: 'crossReference' }>> {
    const result: Array<Extract<InlineNode, { type: 'crossReference' }>> = [];
    for (const node of nodes) {
        if (node.type === 'crossReference') {
            result.push(node);
        } else if (node.type === 'emphasis' || node.type === 'strong') {
            result.push(...collectCrossReferences(node.children));
        }
    }
    return result;
}
