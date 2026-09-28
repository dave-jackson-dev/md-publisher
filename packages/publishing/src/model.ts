import * as path from 'node:path';
import { isCrossReference, isFrontMatter, isHeading, parseCrossReference, parseHeading, slugify, type Document } from 'md-publisher-language';
import type { Chapter, ChapterBlock, ParagraphRun } from './types.js';

const TOC_SOURCE_PATTERN = /^\s*toc\s*:\s*true\s*$/im;

/**
 * Compiles one already-validated Document into the Publishing context's target-independent
 * Chapter representation. Front matter is inspected only for the `toc: true` marker (BR-6) and
 * otherwise doesn't produce rendered content. Consecutive non-heading elements are grouped into
 * one paragraph — the flat grammar (see packages/language) has no paragraph boundaries of its
 * own, so a heading (or front matter, or end of document) is what ends a paragraph here.
 */
export function compileChapter(sourcePath: string, document: Document): Chapter {
    const fileBaseName = path.basename(sourcePath, path.extname(sourcePath));
    const blocks: ChapterBlock[] = [];
    let currentRuns: ParagraphRun[] | undefined;
    let tocSource = false;
    let title: string | undefined;

    const flushParagraph = () => {
        if (currentRuns && currentRuns.length > 0) {
            blocks.push({ type: 'paragraph', runs: currentRuns });
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
        // PlainRun
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
