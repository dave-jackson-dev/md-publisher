import type { Chapter } from './types.js';

/**
 * Maps a heading anchor slug to the chapter that declares it. Safe to build unconditionally
 * because generation only ever runs against a Publication the CLI has already confirmed has zero
 * Structure Violations — BR-1/BR-4 (see packages/language) guarantee every cross-reference
 * resolves to exactly one heading before a Chapter ever reaches this package.
 */
export function buildSlugIndex(chapters: Chapter[]): Map<string, number> {
    const index = new Map<string, number>();
    chapters.forEach((chapter, chapterIndex) => {
        for (const block of chapter.blocks) {
            if (block.type === 'heading') {
                index.set(block.slug, chapterIndex);
            }
        }
    });
    return index;
}
