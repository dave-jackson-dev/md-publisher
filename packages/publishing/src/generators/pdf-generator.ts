import * as fs from 'node:fs';
import * as fsPromises from 'node:fs/promises';
import * as path from 'node:path';
import PDFDocument from 'pdfkit';
import type { CompiledPublication, ParagraphRun } from '../types.js';

const HEADING_FONT_SIZES = [24, 20, 16, 14, 12, 11];

function runText(run: ParagraphRun): string {
    return run.type === 'text' ? run.value : run.text;
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
        for (const block of chapter.blocks) {
            if (block.type === 'heading') {
                doc.fontSize(HEADING_FONT_SIZES[block.level - 1]).font('Helvetica-Bold').text(block.text, { paragraphGap: 8 });
            } else {
                const text = block.runs.map(runText).join('');
                doc.fontSize(11).font('Helvetica').text(text, { paragraphGap: 8 });
            }
        }
    });

    doc.end();
    await finished;
    return artifactPath;
}
