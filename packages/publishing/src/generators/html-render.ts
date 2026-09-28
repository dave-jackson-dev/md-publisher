import type { Chapter, ChapterBlock, ParagraphRun } from '../types.js';

export function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Renders one Chapter's blocks to an HTML/XHTML body fragment. `hrefFor` decides how a
 * cross-reference's target chapter index becomes a link target, so the Web generator (one
 * `.html` file per chapter, in the same directory) and the EPUB generator (one `.xhtml` file per
 * chapter, inside the EPUB package) can share this without duplicating block-rendering logic.
 */
export function renderChapterBody(
    chapter: Chapter,
    chapterIndex: number,
    slugIndex: Map<string, number>,
    hrefFor: (targetChapterIndex: number, targetSlug: string) => string
): string {
    return chapter.blocks.map(block => renderBlock(block, chapterIndex, slugIndex, hrefFor)).join('\n');
}

function renderBlock(
    block: ChapterBlock,
    chapterIndex: number,
    slugIndex: Map<string, number>,
    hrefFor: (targetChapterIndex: number, targetSlug: string) => string
): string {
    if (block.type === 'heading') {
        const tag = `h${block.level}`;
        return `<${tag} id="${escapeHtml(block.slug)}">${escapeHtml(block.text)}</${tag}>`;
    }
    const runs = block.runs.map(run => renderRun(run, slugIndex, hrefFor)).join('');
    return `<p>${runs}</p>`;
}

function renderRun(
    run: ParagraphRun,
    slugIndex: Map<string, number>,
    hrefFor: (targetChapterIndex: number, targetSlug: string) => string
): string {
    if (run.type === 'text') {
        return escapeHtml(run.value);
    }
    // Validation (BR-1/BR-4) already guarantees every cross-reference resolves to exactly one
    // heading by the time generation runs; see slug-index.ts.
    const targetChapterIndex = slugIndex.get(run.targetSlug)!;
    return `<a href="${hrefFor(targetChapterIndex, run.targetSlug)}">${escapeHtml(run.text)}</a>`;
}
