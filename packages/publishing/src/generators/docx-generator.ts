import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Bookmark, Document as DocxDocument, HeadingLevel, InternalHyperlink, Packer, PageBreak, Paragraph, TextRun } from 'docx';
import type { ChapterBlock, ParagraphRun, CompiledPublication } from '../types.js';

const HEADING_LEVELS = [
    HeadingLevel.HEADING_1,
    HeadingLevel.HEADING_2,
    HeadingLevel.HEADING_3,
    HeadingLevel.HEADING_4,
    HeadingLevel.HEADING_5,
    HeadingLevel.HEADING_6
];

function renderRun(run: ParagraphRun): TextRun | InternalHyperlink {
    if (run.type === 'text') {
        return new TextRun(run.value);
    }
    return new InternalHyperlink({
        anchor: run.targetSlug,
        children: [new TextRun({ text: run.text, style: 'Hyperlink' })]
    });
}

function renderBlock(block: ChapterBlock): Paragraph {
    if (block.type === 'heading') {
        return new Paragraph({
            heading: HEADING_LEVELS[block.level - 1],
            children: [new Bookmark({ id: block.slug, children: [new TextRun(block.text)] })]
        });
    }
    return new Paragraph({ children: block.runs.map(renderRun) });
}

/**
 * Generates a DOCX Build Target with real internal navigation: each heading becomes a Word
 * bookmark (its anchor slug) and each cross-reference becomes an internal hyperlink to that
 * bookmark. Unlike Web/EPUB (separate files per chapter), every chapter lives in one shared
 * document, so a hyperlink can reference a bookmark by slug directly with no chapter-file lookup.
 * No Build-Target-specific structural requirement applies to DOCX (BR-6 is EPUB-only), so this
 * never throws a BuildTargetViolation.
 */
export async function generateDocx(publication: CompiledPublication, outDir: string): Promise<string> {
    const children = publication.chapters.flatMap((chapter, chapterIndex) => {
        const paragraphs = chapter.blocks.map(renderBlock);
        return chapterIndex === 0 ? paragraphs : [new Paragraph({ children: [new PageBreak()] }), ...paragraphs];
    });

    const doc = new DocxDocument({ sections: [{ children }] });
    const buffer = await Packer.toBuffer(doc);

    const artifactPath = path.join(outDir, `${publication.name}.docx`);
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(artifactPath, buffer);
    return artifactPath;
}
