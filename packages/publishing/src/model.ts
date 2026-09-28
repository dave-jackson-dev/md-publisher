import * as path from 'node:path';
import { isCrossReference, isFrontMatter, isHeading, isParagraphBreak, parseCrossReference, parseHeading, slugify, type Document } from 'md-publisher-language';
import type { Chapter, ChapterBlock, ParagraphRun } from './types.js';

const TOC_SOURCE_PATTERN = /^\s*toc\s*:\s*true\s*$/im;
const SOFT_BREAK_PATTERN = /^\r?\n$/;

function isWhitespaceOnly(run: ParagraphRun): boolean {
    return run.type === 'text' && run.value.trim() === '';
}

/**
 * Compiles one already-validated Document into the Publishing context's target-independent
 * Chapter representation. Front matter is inspected only for the `toc: true` marker (BR-6) and
 * otherwise doesn't produce rendered content. A ParagraphBreak (a blank line) ends the current
 * paragraph, same as a heading or the end of the Document; a PlainRun whose raw text is a single
 * line break (a soft-wrapped line within one paragraph — the grammar can't tell them apart at the
 * lexer level, see md-publisher.langium) becomes a joining space instead of being dropped, so two
 * source lines wrapped without a blank line between them don't get glued together with no
 * separator at all.
 */
export function compileChapter(sourcePath: string, document: Document): Chapter {
    const fileBaseName = path.basename(sourcePath, path.extname(sourcePath));
    const blocks: ChapterBlock[] = [];
    let currentRuns: ParagraphRun[] | undefined;
    let tocSource = false;
    let title: string | undefined;

    const flushParagraph = () => {
        if (currentRuns) {
            while (currentRuns.length > 0 && isWhitespaceOnly(currentRuns[currentRuns.length - 1])) {
                currentRuns.pop();
            }
            if (currentRuns.length > 0) {
                blocks.push({ type: 'paragraph', runs: currentRuns });
            }
        }
        currentRuns = undefined;
    };

    for (const element of document.elements) {
        if (isFrontMatter(element)) {
            if (TOC_SOURCE_PATTERN.test(element.raw)) {
                tocSource = true;
            }
            continue;
        }
        if (isParagraphBreak(element)) {
            flushParagraph();
            continue;
        }
        if (isHeading(element)) {
            flushParagraph();
            const { level, text } = parseHeading(element.raw);
            if (title === undefined) {
                title = text;
            }
            blocks.push({ type: 'heading', level, text, slug: slugify(text) });
            continue;
        }
        if (isCrossReference(element)) {
            const { text, anchor } = parseCrossReference(element.raw);
            (currentRuns ??= []).push({ type: 'link', text, targetSlug: anchor.toLowerCase() });
            continue;
        }
        // PlainRun: either real text/bracket content, or a soft-wrapped line break standing in
        // for a space between the runs on either side of it.
        if (SOFT_BREAK_PATTERN.test(element.raw)) {
            if (currentRuns && currentRuns.length > 0 && !isWhitespaceOnly(currentRuns[currentRuns.length - 1])) {
                currentRuns.push({ type: 'text', value: ' ' });
            }
            continue;
        }
        (currentRuns ??= []).push({ type: 'text', value: element.raw });
    }
    flushParagraph();

    return {
        sourcePath,
        fileBaseName,
        title: title ?? fileBaseName,
        tocSource,
        blocks
    };
}
