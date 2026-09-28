import type { Chapter, ChapterBlock, ChapterListItem, ParagraphRun } from '../types.js';

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
    switch (block.type) {
        case 'heading': {
            const tag = `h${block.level}`;
            return `<${tag} id="${escapeHtml(block.slug)}">${escapeHtml(block.text)}</${tag}>`;
        }
        case 'paragraph': {
            const runs = block.runs.map(run => renderRun(run, slugIndex, hrefFor)).join('');
            return `<p>${runs}</p>`;
        }
        case 'codeBlock': {
            const languageClass = block.language ? ` class="language-${escapeHtml(block.language)}"` : '';
            return `<pre><code${languageClass}>${escapeHtml(block.content)}</code></pre>`;
        }
        case 'thematicBreak':
            return '<hr>';
        case 'blockQuote': {
            const inner = block.blocks.map(child => renderBlock(child, chapterIndex, slugIndex, hrefFor)).join('\n');
            return `<blockquote>\n${inner}\n</blockquote>`;
        }
        case 'list': {
            const tag = block.ordered ? 'ol' : 'ul';
            const items = block.items.map(item => renderListItem(item, chapterIndex, slugIndex, hrefFor)).join('\n');
            return `<${tag}>\n${items}\n</${tag}>`;
        }
    }
}

function renderListItem(
    item: ChapterListItem,
    chapterIndex: number,
    slugIndex: Map<string, number>,
    hrefFor: (targetChapterIndex: number, targetSlug: string) => string
): string {
    const text = item.runs.map(run => renderRun(run, slugIndex, hrefFor)).join('');
    const children = item.children.map(child => renderBlock(child, chapterIndex, slugIndex, hrefFor)).join('\n');
    return `<li>${text}${children ? `\n${children}` : ''}</li>`;
}

function renderRun(
    run: ParagraphRun,
    slugIndex: Map<string, number>,
    hrefFor: (targetChapterIndex: number, targetSlug: string) => string
): string {
    switch (run.type) {
        case 'text':
            return escapeHtml(run.value);
        case 'crossReference': {
            // Validation (BR-1/BR-4) already guarantees every cross-reference resolves to
            // exactly one heading by the time generation runs; see slug-index.ts.
            const targetChapterIndex = slugIndex.get(run.targetSlug)!;
            return `<a href="${hrefFor(targetChapterIndex, run.targetSlug)}">${escapeHtml(run.text)}</a>`;
        }
        case 'externalLink':
            return `<a href="${escapeHtml(run.url)}">${escapeHtml(run.text)}</a>`;
        case 'image':
            return `<img src="${escapeHtml(run.url)}" alt="${escapeHtml(run.alt)}">`;
        case 'code':
            return `<code>${escapeHtml(run.value)}</code>`;
        case 'emphasis':
            return `<em>${run.runs.map(child => renderRun(child, slugIndex, hrefFor)).join('')}</em>`;
        case 'strong':
            return `<strong>${run.runs.map(child => renderRun(child, slugIndex, hrefFor)).join('')}</strong>`;
        case 'hardBreak':
            return '<br>';
    }
}
