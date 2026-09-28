import * as fs from 'node:fs';
import * as fsPromises from 'node:fs/promises';
import * as path from 'node:path';
import PDFDocument from 'pdfkit';
import type { Chapter, ChapterBlock, ChapterListItem, CompiledPublication, ParagraphRun } from '../types.js';

const HEADING_FONT_SIZES = [24, 20, 16, 14, 12, 11];
const INDENT_PER_LEVEL = 24;

/**
 * Flattens a run to its visible text. Bold/italic/code styling and real image embedding would
 * need multiple styled `.text()` calls per paragraph in pdfkit's layout model, a bigger change
 * than this generator's existing scope note already accepts (see below) — every run still
 * renders its own text content correctly, just without the corresponding visual distinction.
 */
function runText(run: ParagraphRun): string {
    switch (run.type) {
        case 'text':
            return run.value;
        case 'crossReference':
        case 'externalLink':
            return run.text;
        case 'code':
            return run.value;
        case 'image':
            return `[Image: ${run.alt || run.url}]`;
        case 'emphasis':
        case 'strong':
            return run.runs.map(runText).join('');
        case 'hardBreak':
            return '\n';
    }
}

function renderListItems(doc: PDFKit.PDFDocument, items: ChapterListItem[], ordered: boolean, level: number): void {
    items.forEach((item, index) => {
        const marker = ordered ? `${index + 1}. ` : '• ';
        const text = marker + item.runs.map(runText).join('');
        doc.fontSize(11).font('Helvetica').text(text, { indent: level * INDENT_PER_LEVEL, paragraphGap: 4 });
        for (const child of item.children) {
            renderListItems(doc, child.items, child.ordered, level + 1);
        }
    });
}

function renderBlock(doc: PDFKit.PDFDocument, block: ChapterBlock, quoteDepth = 0): void {
    const indent = quoteDepth * INDENT_PER_LEVEL;
    switch (block.type) {
        case 'heading':
            doc.fontSize(HEADING_FONT_SIZES[block.level - 1]).font('Helvetica-Bold').text(block.text, { paragraphGap: 8 });
            return;
        case 'paragraph': {
            const text = block.runs.map(runText).join('');
            doc.fontSize(11).font('Helvetica').text(text, { indent, paragraphGap: 8 });
            return;
        }
        case 'codeBlock':
            doc.fontSize(9).font('Courier').text(block.content, { indent, paragraphGap: 8 });
            return;
        case 'thematicBreak': {
            const y = doc.y + 6;
            doc.moveTo(doc.page.margins.left, y).lineTo(doc.page.width - doc.page.margins.right, y).stroke();
            doc.moveDown();
            return;
        }
        case 'blockQuote':
            for (const child of block.blocks) {
                renderBlock(doc, child, quoteDepth + 1);
            }
            return;
        case 'list':
            renderListItems(doc, block.items, block.ordered, 0);
            return;
    }
}

function renderChapter(doc: PDFKit.PDFDocument, chapter: Chapter): void {
    for (const block of chapter.blocks) {
        renderBlock(doc, block);
    }
}

/**
 * Generates a PDF Build Target: continuous text, one page break per chapter, headings sized by
 * level. Cross-references render as their link text only — pdfkit's per-glyph layout makes
 * tracking exact bookmark positions for real internal navigation significantly more involved than
 * DOCX/EPUB/Web's anchor-based linking, and no Gherkin scenario in this Iteration requires
 * clickable PDF cross-references (only EPUB navigation is specified, in Feature 7). No
 * Build-Target-specific structural requirement applies to PDF (BR-6 is EPUB-only), so this never
 * throws a BuildTargetViolation.
 */
export async function generatePdf(publication: CompiledPublication, outDir: string): Promise<string> {
    await fsPromises.mkdir(outDir, { recursive: true });
    const artifactPath = path.join(outDir, `${publication.name}.pdf`);

    const doc = new PDFDocument({ margin: 54 });
    const writeStream = fs.createWriteStream(artifactPath);
    const finished = new Promise<void>((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
    });
    doc.pipe(writeStream);

    publication.chapters.forEach((chapter, chapterIndex) => {
        if (chapterIndex > 0) {
            doc.addPage();
        }
        renderChapter(doc, chapter);
    });

    doc.end();
    await finished;
    return artifactPath;
}
