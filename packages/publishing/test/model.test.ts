import { describe, expect, test } from 'vitest';
import { EmptyFileSystem } from 'langium';
import { parseHelper } from 'langium/test';
import { createMdPublisherServices, type Document } from 'md-publisher-language';
import { compileChapter } from '../src/model.js';

async function parseDocument(input: string): Promise<Document> {
    const services = createMdPublisherServices(EmptyFileSystem);
    const document = await parseHelper<Document>(services.MdPublisher)(input, { validation: false });
    return document.parseResult.value;
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
            expect(paragraph.runs).toContainEqual({ type: 'link', text: 'Setup', targetSlug: 'setup' });
        }
    });
});
