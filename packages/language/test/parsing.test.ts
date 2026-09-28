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

describe('Parsing tests', () => {

    test('parses a heading', async () => {
        const document = await parseDocument('## Setup\n');
        const heading = document.parseResult.value.elements[0];
        expect(heading.$type).toBe('Heading');
        expect((heading as { raw: string }).raw).toBe('## Setup');
    });

    test('parses a cross-reference embedded in prose', async () => {
        // Trailing "\n" is a single line break (SOFT_BREAK), its own PlainRun — see the
        // dedicated soft-break/paragraph-break tests below for why that matters.
        const document = await parseDocument('See [Setup](#setup) for prerequisites.\n');
        const types = document.parseResult.value.elements.map(e => e.$type);
        expect(types).toEqual(['PlainRun', 'CrossReference', 'PlainRun', 'PlainRun']);
        const crossRef = document.parseResult.value.elements[1];
        expect((crossRef as { raw: string }).raw).toBe('[Setup](#setup)');
    });

    test('does not treat a mid-line "#" as a heading', async () => {
        const document = await parseDocument('This costs C# five dollars.\n');
        const types = document.parseResult.value.elements.map(e => e.$type);
        expect(types).toEqual(['PlainRun', 'PlainRun']);
    });

    test('parses front matter as its own element', async () => {
        // The blank line between the closing "---" and the heading is its own
        // ParagraphBreak, distinct from the single trailing line break after the heading.
        const document = await parseDocument('---\ntitle: Chapter One\n---\n\n# Chapter One\n');
        const types = document.parseResult.value.elements.map(e => e.$type);
        expect(types).toEqual(['FrontMatter', 'ParagraphBreak', 'Heading', 'PlainRun']);
    });

    test('recognizes front matter wherever it appears, not only at the top', async () => {
        const document = await parseDocument('Some content first.\n---\ntitle: Chapter One\n---\n');
        const types = document.parseResult.value.elements.map(e => e.$type);
        expect(types).toEqual(['PlainRun', 'PlainRun', 'FrontMatter', 'PlainRun']);
    });

    test('parses a heading level skip without erroring', async () => {
        const document = await parseDocument('# Chapter Two\n### Background\n');
        const types = document.parseResult.value.elements.map(e => e.$type);
        expect(types).toEqual(['Heading', 'PlainRun', 'Heading', 'PlainRun']);
    });

    test('a single line break between two lines is a PlainRun (soft break), not a ParagraphBreak', async () => {
        const document = await parseDocument('First line.\nSecond line.\n');
        const types = document.parseResult.value.elements.map(e => e.$type);
        expect(types).not.toContain('ParagraphBreak');
        expect(types).toEqual(['PlainRun', 'PlainRun', 'PlainRun', 'PlainRun']);
    });

    test('a blank line between two lines is a ParagraphBreak', async () => {
        const document = await parseDocument('First paragraph.\n\nSecond paragraph.\n');
        const types = document.parseResult.value.elements.map(e => e.$type);
        expect(types).toEqual(['PlainRun', 'ParagraphBreak', 'PlainRun', 'PlainRun']);
    });

    test('an external (non-anchor) link is plain text, not a CrossReference', async () => {
        const document = await parseDocument('See [the docs](https://example.com) for more.\n');
        const types = document.parseResult.value.elements.map(e => e.$type);
        expect(types).not.toContain('CrossReference');
    });

    test('an unclosed bracket falls back to plain text', async () => {
        const document = await parseDocument('[oops not a link\n');
        expect(document.parseResult.value.elements.every(e => e.$type === 'PlainRun')).toBe(true);
    });
});
