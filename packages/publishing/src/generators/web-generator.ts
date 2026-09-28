import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { buildSlugIndex } from '../slug-index.js';
import type { CompiledPublication } from '../types.js';
import { escapeHtml, renderChapterBody } from './html-render.js';

const STYLES_CSS = `body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; }
nav ul { padding-left: 1.25rem; }
`;

function chapterFileName(fileBaseName: string): string {
    return `${fileBaseName}.html`;
}

function page(title: string, body: string): string {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
${body}
</body>
</html>
`;
}

/**
 * Generates a Web Build Target: `<outDir>/<publication name>/index.html` (a landing page linking
 * every chapter) plus one `<chapter>.html` file per chapter, in Publication order. No
 * Build-Target-specific structural requirement applies to Web (BR-6 is EPUB-only), so this never
 * throws a BuildTargetViolation.
 */
export async function generateWeb(publication: CompiledPublication, outDir: string): Promise<string> {
    const siteDir = path.join(outDir, publication.name);
    await fs.mkdir(siteDir, { recursive: true });
    await fs.writeFile(path.join(siteDir, 'styles.css'), STYLES_CSS, 'utf-8');

    const slugIndex = buildSlugIndex(publication.chapters);
    const hrefFor = (targetChapterIndex: number, targetSlug: string) =>
        `${chapterFileName(publication.chapters[targetChapterIndex].fileBaseName)}#${targetSlug}`;

    const nav = `<nav><ul>${publication.chapters
        .map(chapter => `<li><a href="${chapterFileName(chapter.fileBaseName)}">${escapeHtml(chapter.title)}</a></li>`)
        .join('')}</ul></nav>`;

    await fs.writeFile(path.join(siteDir, 'index.html'), page(publication.name, nav), 'utf-8');

    for (const [chapterIndex, chapter] of publication.chapters.entries()) {
        const body = renderChapterBody(chapter, chapterIndex, slugIndex, hrefFor);
        await fs.writeFile(
            path.join(siteDir, chapterFileName(chapter.fileBaseName)),
            page(chapter.title, `${nav}\n${body}`),
            'utf-8'
        );
    }

    return siteDir;
}
