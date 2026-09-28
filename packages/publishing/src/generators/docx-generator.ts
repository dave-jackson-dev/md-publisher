import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
    AlignmentType,
    Bookmark,
    Document as DocxDocument,
    ExternalHyperlink,
    HeadingLevel,
    InternalHyperlink,
    LevelFormat,
    Packer,
    PageBreak,
    Paragraph,
    TextRun
} from 'docx';
import type { ChapterBlock, ChapterListItem, CompiledPublication, ParagraphRun } from '../types.js';

const HEADING_LEVELS = [
    HeadingLevel.HEADING_1,
    HeadingLevel.HEADING_2,
    HeadingLevel.HEADING_3,
    HeadingLevel.HEADING_4,
    HeadingLevel.HEADING_5,
    HeadingLevel.HEADING_6
];

const ORDERED_LIST_REFERENCE = 'md-publisher-ordered-list';
const TWIPS_PER_LEVEL = 720; // 0.5"

type RunChild = TextRun | InternalHyperlink | ExternalHyperlink;

function renderRun(run: ParagraphRun, bold = false, italic = false): RunChild[] {
    switch (run.type) {
        case 'text':
            return [new TextRun({ text: run.value, bold, italics: italic })];
        case 'crossReference':
            return [new InternalHyperlink({
                anchor: run.targetSlug,
                children: [new TextRun({ text: run.text, style: 'Hyperlink', bold, italics: italic })]
            })];
        case 'externalLink':
            return [new ExternalHyperlink({
                link: run.url,
                children: [new TextRun({ text: run.text, style: 'Hyperlink', bold, italics: italic })]
            })];
        case 'code':
            return [new TextRun({ text: run.value, font: 'Consolas', bold, italics: italic })];
        case 'emphasis':
            return run.runs.flatMap(child => renderRun(child, bold, true));
        case 'strong':
            return run.runs.flatMap(child => renderRun(child, true, italic));
        case 'image':
            // Real embedding (reading the file, sizing it) is a follow-up image-asset-handling
            // task — this is a clearly-labeled placeholder, not silently dropped content.
            return [new TextRun({ text: `[Image: ${run.alt || run.url}]`, italics: true })];
        case 'hardBreak':
            return [new TextRun({ text: '', break: 1 })];
    }
}

function renderCodeBlockRuns(content: string): TextRun[] {
    const lines = content.split('\n');
    return lines.flatMap((line, index) => {
        const run = new TextRun({ text: line, font: 'Consolas', size: 20 });
        return index < lines.length - 1 ? [run, new TextRun({ text: '', break: 1, font: 'Consolas' })] : [run];
    });
}

function renderListItems(items: ChapterListItem[], ordered: boolean, level: number): Paragraph[] {
    return items.flatMap(item => {
        const own = new Paragraph({
            children: item.runs.flatMap(run => renderRun(run)),
            ...(ordered
                ? { numbering: { reference: ORDERED_LIST_REFERENCE, level } }
                : { bullet: { level } })
        });
        const nested = item.children.flatMap(list => renderListItems(list.items, list.ordered, level + 1));
        return [own, ...nested];
    });
}

function renderBlock(block: ChapterBlock, blockQuoteDepth = 0): Paragraph[] {
    const indent = blockQuoteDepth > 0 ? { left: blockQuoteDepth * TWIPS_PER_LEVEL } : undefined;

    switch (block.type) {
        case 'heading':
            return [new Paragraph({
                heading: HEADING_LEVELS[block.level - 1],
                children: [new Bookmark({ id: block.slug, children: [new TextRun(block.text)] })]
            })];
        case 'paragraph':
            return [new Paragraph({ children: block.runs.flatMap(run => renderRun(run)), indent })];
        case 'codeBlock':
            return [new Paragraph({ children: renderCodeBlockRuns(block.content), indent, shading: { fill: 'F2F2F2' } })];
        case 'thematicBreak':
            return [new Paragraph({ children: [new TextRun('─'.repeat(40))], alignment: AlignmentType.CENTER })];
        case 'blockQuote':
            return block.blocks.flatMap(child => renderBlock(child, blockQuoteDepth + 1));
        case 'list':
            return renderListItems(block.items, block.ordered, 0);
    }
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
        const paragraphs = chapter.blocks.flatMap(block => renderBlock(block));
        return chapterIndex === 0 ? paragraphs : [new Paragraph({ children: [new PageBreak()] }), ...paragraphs];
    });

    const doc = new DocxDocument({
        numbering: {
            config: [{
                reference: ORDERED_LIST_REFERENCE,
                levels: [0, 1, 2, 3].map(level => ({
                    level,
                    format: LevelFormat.DECIMAL,
                    text: `%${level + 1}.`,
                    alignment: AlignmentType.START,
                    style: { paragraph: { indent: { left: (level + 1) * TWIPS_PER_LEVEL, hanging: 360 } } }
                }))
            }]
        },
        sections: [{ children }]
    });
    const buffer = await Packer.toBuffer(doc);

    const artifactPath = path.join(outDir, `${publication.name}.docx`);
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(artifactPath, buffer);
    return artifactPath;
}
