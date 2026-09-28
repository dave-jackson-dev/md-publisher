import { beforeEach, describe, expect, test } from "vitest";
import { EmptyFileSystem, type LangiumDocument } from "langium";
import { parseHelper } from "langium/test";
import type { Diagnostic } from "vscode-languageserver-types";
import { createMdPublisherServices } from "../src/md-publisher-module.js";
import type { Document } from "../src/generated/ast.js";

// Cross-reference/anchor resolution (BR-1, BR-4) is Publication-scoped: a Document links
// against headings in every Document currently loaded in the shared workspace, not only
// itself. These tests exercise that multi-document behavior specifically; single-document
// Structure Violation checks live in validating.test.ts.
let services: ReturnType<typeof createMdPublisherServices>;

beforeEach(() => {
    services = createMdPublisherServices(EmptyFileSystem);
});

function violations(document: LangiumDocument): Diagnostic[] {
    return (document.diagnostics ?? []).filter(d => d.code === 'structure-violation');
}

describe('Linking tests', () => {

    test('a cross-reference resolves against a heading in a different Document of the same Publication', async () => {
        const guide = await parseHelper<Document>(services.MdPublisher)('## Setup\n', { validation: false, documentUri: 'file:///guide.mdpub' });
        const intro = await parseHelper<Document>(services.MdPublisher)('See [Setup](#setup) for prerequisites.\n', { validation: false, documentUri: 'file:///intro.mdpub' });
        await services.shared.workspace.DocumentBuilder.build([guide, intro], { validation: true });

        expect(violations(intro)).toHaveLength(0);
    });

    test('two Documents each declaring the same heading text is an ambiguous target for both', async () => {
        const intro = await parseHelper<Document>(services.MdPublisher)('## Getting Started\n', { validation: false, documentUri: 'file:///intro.mdpub' });
        const chapter1 = await parseHelper<Document>(services.MdPublisher)('## Getting Started\n', { validation: false, documentUri: 'file:///chapter-1.mdpub' });
        await services.shared.workspace.DocumentBuilder.build([intro, chapter1], { validation: true });

        expect(violations(intro)).toHaveLength(1);
        expect(violations(intro)[0].message).toContain('ambiguous');
        expect(violations(chapter1)).toHaveLength(1);
        expect(violations(chapter1)[0].message).toContain('ambiguous');
    });
});
