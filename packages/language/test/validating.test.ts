import { beforeEach, describe, expect, test } from "vitest";
import { EmptyFileSystem, type LangiumDocument } from "langium";
import { parseHelper } from "langium/test";
import type { Diagnostic } from "vscode-languageserver-types";
import { createMdPublisherServices } from "../src/md-publisher-module.js";
import type { Document } from "../src/generated/ast.js";

// Fresh services per test: MdPublisherServices.shared.workspace.LangiumDocuments accumulates
// every document ever parsed through it, and cross-reference resolution (BR-1/BR-4) deliberately
// looks across all currently-loaded documents to stand in for "the whole Publication" — reusing
// one services instance across tests would let one test's headings leak into another's anchor
// resolution.
let services: ReturnType<typeof createMdPublisherServices>;

beforeEach(() => {
    services = createMdPublisherServices(EmptyFileSystem);
});

async function parse(input: string, documentUri?: string): Promise<LangiumDocument<Document>> {
    return parseHelper<Document>(services.MdPublisher)(input, { validation: true, documentUri });
}

function violations(document: LangiumDocument): Diagnostic[] {
    return (document.diagnostics ?? []).filter(d => d.code === 'structure-violation');
}

describe('Validating: BR-1 and BR-4 (cross-references)', () => {

    test('a Publication with only valid cross-references raises no violation', async () => {
        const document = await parse('## Setup\n\nSee [Setup](#setup) for prerequisites.\n');
        expect(violations(document)).toHaveLength(0);
    });

    test('a cross-reference to a nonexistent heading is a Structure Violation naming the target', async () => {
        const document = await parse('See [Setup](#setup) for prerequisites.\n');
        const found = violations(document);
        expect(found).toHaveLength(1);
        expect(found[0].message).toContain('#setup');
    });
});

describe('Validating: BR-2 and BR-3 (front matter and heading order)', () => {

    test('front matter placed after content is a Structure Violation', async () => {
        const document = await parse('First paragraph of content.\n\n---\ntitle: Chapter One\n---\n');
        expect(violations(document)).toHaveLength(1);
    });

    test('front matter at the top of the Document raises no violation', async () => {
        const document = await parse('---\ntitle: Chapter One\n---\n\n# Chapter One\n');
        expect(violations(document)).toHaveLength(0);
    });

    test('a heading level skip is a Structure Violation naming the skipped level', async () => {
        const document = await parse('# Chapter Two\n\n### Background\n');
        const found = violations(document);
        expect(found).toHaveLength(1);
        expect(found[0].message).toContain('H2');
    });

    test('consecutive heading levels raise no violation', async () => {
        const document = await parse('# Chapter Two\n\n## Background\n');
        expect(violations(document)).toHaveLength(0);
    });
});
