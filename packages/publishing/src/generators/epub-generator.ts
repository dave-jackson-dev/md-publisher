import * as crypto from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import JSZip from 'jszip';
import { buildSlugIndex } from '../slug-index.js';
import type { CompiledPublication } from '../types.js';
import { BuildTargetViolation } from '../violations.js';
import { escapeHtml, renderChapterBody } from './html-render.js';

const STYLES_CSS = `body { font-family: serif; line-height: 1.5; margin: 1em; }
`;

function chapterFileName(chapterIndex: number): string {
    return `chapter${chapterIndex}.xhtml`;
}

function xhtmlPage(title: string, body: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
${body}
</body>
</html>
`;
}

/**
 * Generates an EPUB3 Build Target as a real, valid package (mimetype, container, OPF manifest +
 * spine, an EPUB3 nav document, and one XHTML chapter per Document). Requires BR-6's structural
 * marker: at least one chapter's front matter must declare `toc: true`, or generation of this one
 * target is refused with a BuildTargetViolation — distinct from, and unrelated to, a Structure
 * Violation (which would have refused the whole Generation before reaching this package at all).
 */
export async function generateEpub(publication: CompiledPublication, outDir: string): Promise<string> {
    if (!publication.chapters.some(chapter => chapter.tocSource)) {
        throw new BuildTargetViolation(
            'epub',
            'No chapter is marked as the table-of-contents source (add `toc: true` to one chapter\'s front matter).'
        );
    }

    const zip = new JSZip();
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

    zip.folder('META-INF')!.file('container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`);

    const oebps = zip.folder('OEBPS')!;
    oebps.file('styles.css', STYLES_CSS);

    const slugIndex = buildSlugIndex(publication.chapters);
    const hrefFor = (targetChapterIndex: number, targetSlug: string) =>
        `${chapterFileName(targetChapterIndex)}#${targetSlug}`;

    publication.chapters.forEach((chapter, chapterIndex) => {
        const body = renderChapterBody(chapter, chapterIndex, slugIndex, hrefFor);
        oebps.file(chapterFileName(chapterIndex), xhtmlPage(chapter.title, body));
    });

    oebps.file('nav.xhtml', `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><meta charset="utf-8"/><title>Table of Contents</title></head>
<body>
<nav epub:type="toc" id="toc">
<ol>
${publication.chapters.map((chapter, chapterIndex) => `<li><a href="${chapterFileName(chapterIndex)}">${escapeHtml(chapter.title)}</a></li>`).join('\n')}
</ol>
</nav>
</body>
</html>
`);

    const bookId = `urn:uuid:${crypto.randomUUID()}`;
    const manifestItems = publication.chapters
        .map((_, chapterIndex) => `<item id="chapter${chapterIndex}" href="${chapterFileName(chapterIndex)}" media-type="application/xhtml+xml"/>`)
        .join('\n');
    const spineItems = publication.chapters
        .map((_, chapterIndex) => `<itemref idref="chapter${chapterIndex}"/>`)
        .join('\n');

    oebps.file('content.opf', `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">${bookId}</dc:identifier>
    <dc:title>${escapeHtml(publication.name)}</dc:title>
    <dc:language>en</dc:language>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" properties="nav" media-type="application/xhtml+xml"/>
    <item id="css" href="styles.css" media-type="text/css"/>
${manifestItems}
  </manifest>
  <spine>
${spineItems}
  </spine>
</package>
`);

    const artifactPath = path.join(outDir, `${publication.name}.epub`);
    await fs.mkdir(outDir, { recursive: true });
    const buffer = await zip.generateAsync({ type: 'nodebuffer' });
    await fs.writeFile(artifactPath, buffer);
    return artifactPath;
}
