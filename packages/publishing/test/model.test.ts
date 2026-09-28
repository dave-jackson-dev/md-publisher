import { describe, expect, test } from 'vitest';
import { EmptyFileSystem } from 'langium';
import { parseHelper } from 'langium/test';
import { createMdPublisherServices, type Document } from 'md-publisher-language';
import { compileChapter } from '../src/model.js';
import type { ChapterBlockQuoteBlock, ChapterCodeBlock, ChapterListBlock, ChapterParagraphBlock, ParagraphRun } from '../src/types.js';

async function parseDocument(input: string): Promise<Document> {
    const services = createMdPublisherServices(EmptyFileSystem);
    const document = await parseHelper<Document>(services.MdPublisher)(input, { validation: false });
    return document.parseResult.value;
}

function runText(run: ParagraphRun): string {
    switch (run.type) {
        case 'text': return run.value;
        case 'crossReference': case 'externalLink': return run.text;
        case 'code': return run.value;
        case 'image': return `[${run.alt}]`;
        case 'emphasis': case 'strong': return run.runs.map(runText).join('');
        case 'hardBreak': return '\n';
    }
}

function flattenText(paragraph: ChapterParagraphBlock): string {
    return paragraph.runs.map(runText).join('');
}

describe('compileChapter', () => {

    test('groups headings and paragraphs, deriving the chapter title from the first heading', async () => {
        const document = await parseDocument('# Chapter One\n\nSome intro text.\n\n## Setup\n\nMore text.\n');
        const chapter = compileChapter('/pub/01-chapter-one.mdpub', document);

        expect(chapter.title).toBe('Chapter One');
        expect(chapter.fileBaseName).toBe('01-chapter-one');
        expect(chapter.blocks.map(b => b.type)).toEqual(['heading', 'paragraph', 'heading', 'paragraph']);
    });

    test('falls back to the file base name when there is no heading', async () => {
        const document = await parseDocument('Just some text, no heading.\n');
        const chapter = compileChapter('/pub/notes.mdpub', document);
        expect(chapter.title).toBe('notes');
    });

    test('detects the toc: true front matter marker', async () => {
        const document = await parseDocument('---\ntitle: Intro\ntoc: true\n---\n\n# Intro\n');
        const chapter = compileChapter('/pub/intro.mdpub', document);
        expect(chapter.tocSource).toBe(true);
    });

    test('a chapter without the toc marker is not a toc source', async () => {
        const document = await parseDocument('# Intro\n');
        const chapter = compileChapter('/pub/intro.mdpub', document);
        expect(chapter.tocSource).toBe(false);
    });

    test('a cross-reference becomes a link run with a lowercased target slug', async () => {
        const document = await parseDocument('See [Setup](#setup) for prerequisites.\n');
        const chapter = compileChapter('/pub/guide.mdpub', document);
        const paragraph = chapter.blocks[0];
        expect(paragraph.type).toBe('paragraph');
        if (paragraph.type === 'paragraph') {
            expect(paragraph.runs).toContainEqual({ type: 'crossReference', text: 'Setup', targetSlug: 'setup' });
        }
    });

    test('two lines wrapped without a blank line between them stay one paragraph, joined by a space', async () => {
        const document = await parseDocument('This is a long sentence that a writer\nwrapped onto a second line.\n');
        const chapter = compileChapter('/pub/notes.mdpub', document);

        expect(chapter.blocks).toHaveLength(1);
        const paragraph = chapter.blocks[0] as ChapterParagraphBlock;
        expect(flattenText(paragraph)).toBe('This is a long sentence that a writer wrapped onto a second line.');
    });

    test('a blank line between two lines starts a new paragraph, not one glued-together paragraph', async () => {
        const document = await parseDocument('First paragraph ends here.\n\nSecond paragraph starts here.\n');
        const chapter = compileChapter('/pub/notes.mdpub', document);

        expect(chapter.blocks).toHaveLength(2);
        expect(flattenText(chapter.blocks[0] as ChapterParagraphBlock)).toBe('First paragraph ends here.');
        expect(flattenText(chapter.blocks[1] as ChapterParagraphBlock)).toBe('Second paragraph starts here.');
    });

    test('a flat list groups consecutive items into one list block', async () => {
        const document = await parseDocument('- First\n- Second\n- Third\n');
        const chapter = compileChapter('/pub/notes.mdpub', document);

        expect(chapter.blocks).toHaveLength(1);
        const list = chapter.blocks[0] as ChapterListBlock;
        expect(list.type).toBe('list');
        expect(list.ordered).toBe(false);
        expect(list.items.map(item => flattenRuns(item.runs))).toEqual(['First', 'Second', 'Third']);
    });

    test('an indented item nests as a sub-list under the preceding item', async () => {
        const document = await parseDocument('- First\n- Second\n  - Nested\n- Third\n');
        const chapter = compileChapter('/pub/notes.mdpub', document);

        const list = chapter.blocks[0] as ChapterListBlock;
        expect(list.items).toHaveLength(3);
        expect(list.items[0].children).toHaveLength(0);
        expect(list.items[1].children).toHaveLength(1);
        const nested = list.items[1].children[0];
        expect(nested.items.map(item => flattenRuns(item.runs))).toEqual(['Nested']);
        expect(list.items[2].children).toHaveLength(0);
    });

    test('an ordered list is distinguished from an unordered one', async () => {
        const document = await parseDocument('1. First\n2. Second\n');
        const chapter = compileChapter('/pub/notes.mdpub', document);
        expect((chapter.blocks[0] as ChapterListBlock).ordered).toBe(true);
    });

    test('a blank line ends a list, starting a fresh block afterward', async () => {
        const document = await parseDocument('- Item\n\nAfter the list.\n');
        const chapter = compileChapter('/pub/notes.mdpub', document);
        expect(chapter.blocks.map(b => b.type)).toEqual(['list', 'paragraph']);
    });

    test('consecutive blockquote lines group into one blockquote paragraph', async () => {
        const document = await parseDocument('> Line one\n> line two\n');
        const chapter = compileChapter('/pub/notes.mdpub', document);

        expect(chapter.blocks).toHaveLength(1);
        const quote = chapter.blocks[0] as ChapterBlockQuoteBlock;
        expect(quote.type).toBe('blockQuote');
        expect(quote.blocks).toHaveLength(1);
        expect(flattenText(quote.blocks[0] as ChapterParagraphBlock)).toBe('Line one line two');
    });

    test('a deeper ">" nests a blockquote inside the outer one', async () => {
        const document = await parseDocument('> Outer\n>> Inner\n');
        const chapter = compileChapter('/pub/notes.mdpub', document);

        const outer = chapter.blocks[0] as ChapterBlockQuoteBlock;
        expect(flattenText(outer.blocks[0] as ChapterParagraphBlock)).toBe('Outer');
        const inner = outer.blocks[1] as ChapterBlockQuoteBlock;
        expect(inner.type).toBe('blockQuote');
        expect(flattenText(inner.blocks[0] as ChapterParagraphBlock)).toBe('Inner');
    });

    test('a spaced "> >" computes the same depth as a packed ">>"', async () => {
        // Neither has a preceding depth-1 line, so both produce one blockquote wrapping the
        // paragraph directly — this checks the spaced and packed marker styles agree with each
        // other on depth, not that spacing changes the resulting structure.
        const spaced = compileChapter('/pub/notes.mdpub', await parseDocument('> > Inner only\n'));
        const packed = compileChapter('/pub/notes.mdpub', await parseDocument('>> Inner only\n'));
        expect(spaced.blocks).toEqual(packed.blocks);

        const quote = spaced.blocks[0] as ChapterBlockQuoteBlock;
        expect(quote.type).toBe('blockQuote');
        expect(flattenText(quote.blocks[0] as ChapterParagraphBlock)).toBe('Inner only');
    });

    test('a fenced code block becomes its own block, content untouched by inline parsing', async () => {
        const document = await parseDocument('```js\nconst x = 1;\n```\n');
        const chapter = compileChapter('/pub/notes.mdpub', document);

        expect(chapter.blocks).toHaveLength(1);
        const code = chapter.blocks[0] as ChapterCodeBlock;
        expect(code).toEqual({ type: 'codeBlock', language: 'js', content: 'const x = 1;' });
    });

    test('a thematic break becomes its own block', async () => {
        const document = await parseDocument('---\n');
        const chapter = compileChapter('/pub/notes.mdpub', document);
        expect(chapter.blocks).toEqual([{ type: 'thematicBreak' }]);
    });
});

function flattenRuns(runs: ParagraphRun[]): string {
    return runs.map(runText).join('');
}
