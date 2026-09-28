import { beforeAll, describe, expect, test } from "vitest";
import { EmptyFileSystem, type LangiumDocument } from "langium";
import { parseHelper } from "langium/test";
import { createMdPublisherServices } from "../src/md-publisher-module.js";
import type { Document } from "../src/generated/ast.js";

let parse: ReturnType<typeof parseHelper<Document>>;

beforeAll(async () => {
    const services = createMdPublisherServices(EmptyFileSystem);
    parse = parseHelper<Document>(services.MdPublisher);
});

async function parseDocument(input: string): Promise<LangiumDocument<Document>> {
    const document = await parse(input, { validation: false });
    expect(document.parseResult.parserErrors).toHaveLength(0);
    expect(document.parseResult.lexerErrors).toHaveLength(0);
    return document;
}

async function types(input: string): Promise<string[]> {
    const document = await parseDocument(input);
    return document.parseResult.value.elements.map(e => e.$type);
}

describe('Block-level parsing (Sprint 2a)', () => {

    test('a thematic break is its own element, distinct from a heading or list item', async () => {
        expect(await types('---\n')).toEqual(['ThematicBreak']);
        expect(await types('***\n')).toEqual(['ThematicBreak']);
        expect(await types('___\n')).toEqual(['ThematicBreak']);
    });

    test('"- - -" is a thematic break, not a 3-item list (matches CommonMark)', async () => {
        expect(await types('- - -\n')).toEqual(['ThematicBreak']);
    });

    test('a single-dash line with real content is a list item, not a thematic break', async () => {
        expect(await types('- Item one\n')).toEqual(['ListItemLine']);
    });

    test('an ordered list item is recognized', async () => {
        expect(await types('1. First\n')).toEqual(['ListItemLine']);
        expect(await types('2) Second\n')).toEqual(['ListItemLine']);
    });

    test('a blockquote line is recognized, including nested depth', async () => {
        const document = await parseDocument('> Quote\n>> Nested quote\n');
        expect(document.parseResult.value.elements.map(e => e.$type)).toEqual(['BlockQuoteLine', 'BlockQuoteLine']);
        const [first, second] = document.parseResult.value.elements as { raw: string }[];
        expect(first.raw).toBe('> Quote');
        expect(second.raw).toBe('>> Nested quote');
    });

    test('a fenced code block is captured verbatim as one element', async () => {
        const document = await parseDocument('```js\nconst x = 1;\n```\n');
        const elements = document.parseResult.value.elements;
        expect(elements.map(e => e.$type)).toEqual(['FencedCodeBlock']);
        expect((elements[0] as { raw: string }).raw).toBe('```js\nconst x = 1;\n```');
    });

    test('a tilde-fenced code block is also recognized', async () => {
        expect(await types('~~~\ncode\n~~~\n')).toEqual(['FencedCodeBlock']);
    });

    test('fenced code block content is not treated as separate lines/headings', async () => {
        const document = await parseDocument('```\n# not a heading\n---\n```\n');
        expect(document.parseResult.value.elements.map(e => e.$type)).toEqual(['FencedCodeBlock']);
    });

    test('a plain paragraph line is a TextLine', async () => {
        expect(await types('Just some prose.\n')).toEqual(['TextLine']);
    });

    test('mixed block types in one Document, in order', async () => {
        const input = '# Title\n\nSome intro text.\n\n- Item one\n- Item two\n\n> A quote\n\n---\n\n```\ncode\n```\n';
        expect(await types(input)).toEqual([
            'Heading',
            'ParagraphBreak',
            'TextLine',
            'ParagraphBreak',
            'ListItemLine',
            'ListItemLine',
            'ParagraphBreak',
            'BlockQuoteLine',
            'ParagraphBreak',
            'ThematicBreak',
            'ParagraphBreak',
            'FencedCodeBlock'
        ]);
    });

    test('front matter is still recognized as its own element at document start', async () => {
        expect(await types('---\ntitle: Chapter One\n---\n\n# Chapter One\n')).toEqual([
            'FrontMatter', 'ParagraphBreak', 'Heading'
        ]);
    });
});
