import * as path from 'node:path';
import {
    isBlockQuoteLine,
    isFencedCodeBlock,
    isFrontMatter,
    isHeading,
    isListItemLine,
    isParagraphBreak,
    isThematicBreak,
    parseBlockQuoteLine,
    parseFencedCodeBlock,
    parseHeading,
    parseInline,
    parseListItemLine,
    slugify,
    type Document,
    type InlineNode
} from 'md-publisher-language';
import type { Chapter, ChapterBlock, ChapterListBlock, ChapterListItem, ParagraphRun } from './types.js';

const TOC_SOURCE_PATTERN = /^\s*toc\s*:\s*true\s*$/im;
// CommonMark's hard-break rule: 2+ trailing spaces, or a trailing backslash, before a line break.
const HARD_BREAK_TRAILING_PATTERN = /(?: {2,}|\\)$/;

function toParagraphRuns(nodes: InlineNode[]): ParagraphRun[] {
    return nodes.map(toParagraphRun);
}

function toParagraphRun(node: InlineNode): ParagraphRun {
    switch (node.type) {
        case 'text':
            return { type: 'text', value: node.value };
        case 'crossReference':
            return { type: 'crossReference', text: node.text, targetSlug: node.anchor };
        case 'link':
            return { type: 'externalLink', text: node.text, url: node.url };
        case 'image':
            return { type: 'image', alt: node.alt, url: node.url };
        case 'code':
            return { type: 'code', value: node.value };
        case 'emphasis':
            return { type: 'emphasis', runs: toParagraphRuns(node.children) };
        case 'strong':
            return { type: 'strong', runs: toParagraphRuns(node.children) };
        case 'hardBreak':
            return { type: 'hardBreak' };
    }
}

/**
 * Joins consecutive raw lines of one paragraph into a single string ready for parseInline,
 * honoring CommonMark's hard-vs-soft break rule: a line ending in 2+ spaces or a backslash forces
 * an explicit break (kept as a literal "\n", which parseInline turns into a hardBreak node);
 * anything else is a soft wrap, joined with a single space.
 */
function joinLines(lines: string[]): string {
    const parts: string[] = [];
    lines.forEach((line, index) => {
        const hardBreak = HARD_BREAK_TRAILING_PATTERN.test(line);
        parts.push(hardBreak ? line.replace(HARD_BREAK_TRAILING_PATTERN, '') : line);
        if (index < lines.length - 1) {
            parts.push(hardBreak ? '\n' : ' ');
        }
    });
    return parts.join('');
}

interface OpenBlockQuote {
    depth: number;
    blocks: ChapterBlock[];
}

interface OpenList {
    indent: number;
    ordered: boolean;
    items: ChapterListItem[];
}

/**
 * Compiles one already-validated Document into the Publishing context's target-independent
 * Chapter representation, grouping the grammar's flat, line-at-a-time elements (see
 * md-publisher.langium's top comment) into actual nested structure.
 *
 * Simplifications kept deliberately narrow in scope (documented here, not silently assumed):
 * blockquotes and lists never nest inside *each other* (only same-kind nesting — a blockquote
 * inside a blockquote, a list inside a list — is supported); a blank line always ends whichever
 * container is open, so multi-paragraph list items and blank-line-separated multi-paragraph
 * blockquote content aren't supported; and a list item's own content is always exactly one line
 * (no lazy-continuation paragraphs within an item). Real docs-as-code and indie-author content
 * overwhelmingly uses simpler shapes than these edge cases — see Sprint 2a's plan
 * (docs/planning/md-publisher/iterations/01/10-sprint-2-grammar-plan.md) for the full rationale.
 */
export function compileChapter(sourcePath: string, document: Document): Chapter {
    const fileBaseName = path.basename(sourcePath, path.extname(sourcePath));
    const blocks: ChapterBlock[] = [];
    let title: string | undefined;
    let tocSource = false;

    let paragraphLines: string[] = [];
    const blockQuoteStack: OpenBlockQuote[] = [];
    const listStack: OpenList[] = [];

    const currentTarget = (): ChapterBlock[] =>
        blockQuoteStack.length > 0 ? blockQuoteStack[blockQuoteStack.length - 1].blocks : blocks;

    const flushParagraph = () => {
        if (paragraphLines.length > 0) {
            const runs = toParagraphRuns(parseInline(joinLines(paragraphLines)));
            if (runs.length > 0) {
                currentTarget().push({ type: 'paragraph', runs });
            }
        }
        paragraphLines = [];
    };

    const closeTopList = () => {
        const finished = listStack.pop();
        if (!finished) {
            return;
        }
        const listBlock: ChapterListBlock = { type: 'list', ordered: finished.ordered, items: finished.items };
        if (listStack.length > 0) {
            const parentItems = listStack[listStack.length - 1].items;
            parentItems[parentItems.length - 1].children.push(listBlock);
        } else {
            currentTarget().push(listBlock);
        }
    };

    const closeAllLists = () => {
        while (listStack.length > 0) {
            closeTopList();
        }
    };

    const closeBlockQuotesDeeperThan = (depth: number) => {
        while (blockQuoteStack.length > 0 && blockQuoteStack[blockQuoteStack.length - 1].depth > depth) {
            const finished = blockQuoteStack.pop()!;
            const parentTarget = blockQuoteStack.length > 0 ? blockQuoteStack[blockQuoteStack.length - 1].blocks : blocks;
            parentTarget.push({ type: 'blockQuote', blocks: finished.blocks });
        }
    };

    const closeEverything = () => {
        flushParagraph();
        closeAllLists();
        closeBlockQuotesDeeperThan(0);
    };

    for (const element of document.elements) {
        if (isFrontMatter(element)) {
            if (TOC_SOURCE_PATTERN.test(element.raw)) {
                tocSource = true;
            }
            continue;
        }
        if (isParagraphBreak(element)) {
            closeEverything();
            continue;
        }
        if (isHeading(element)) {
            closeEverything();
            const { level, text } = parseHeading(element.raw);
            if (title === undefined) {
                title = text;
            }
            blocks.push({ type: 'heading', level, text, slug: slugify(text) });
            continue;
        }
        if (isThematicBreak(element)) {
            closeEverything();
            blocks.push({ type: 'thematicBreak' });
            continue;
        }
        if (isFencedCodeBlock(element)) {
            closeEverything();
            const { language, content } = parseFencedCodeBlock(element.raw);
            blocks.push({ type: 'codeBlock', language, content });
            continue;
        }
        if (isBlockQuoteLine(element)) {
            const { depth, content } = parseBlockQuoteLine(element.raw);
            if (listStack.length > 0) {
                flushParagraph();
                closeAllLists();
            }
            if (blockQuoteStack.length === 0 || blockQuoteStack[blockQuoteStack.length - 1].depth !== depth) {
                flushParagraph();
            }
            closeBlockQuotesDeeperThan(depth);
            if (blockQuoteStack.length === 0 || blockQuoteStack[blockQuoteStack.length - 1].depth < depth) {
                blockQuoteStack.push({ depth, blocks: [] });
            }
            paragraphLines.push(content);
            continue;
        }
        if (isListItemLine(element)) {
            const { indent, ordered, content } = parseListItemLine(element.raw);
            if (blockQuoteStack.length > 0) {
                flushParagraph();
                closeBlockQuotesDeeperThan(0);
            }
            flushParagraph();
            while (listStack.length > 0 && listStack[listStack.length - 1].indent > indent) {
                closeTopList();
            }
            const top = listStack[listStack.length - 1] as OpenList | undefined;
            if (!top || top.indent < indent || top.ordered !== ordered) {
                listStack.push({ indent, ordered, items: [] });
            }
            listStack[listStack.length - 1].items.push({ runs: toParagraphRuns(parseInline(content)), children: [] });
            continue;
        }
        // TextLine
        if (blockQuoteStack.length > 0) {
            flushParagraph();
            closeBlockQuotesDeeperThan(0);
        }
        if (listStack.length > 0) {
            flushParagraph();
            closeAllLists();
        }
        paragraphLines.push(element.raw);
    }
    closeEverything();

    return {
        sourcePath,
        fileBaseName,
        title: title ?? fileBaseName,
        tocSource,
        blocks
    };
}
