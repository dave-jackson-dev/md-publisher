import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import JSZip from 'jszip';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { generateEpub } from '../src/generators/epub-generator.js';
import { BuildTargetViolation } from '../src/violations.js';
import type { CompiledPublication } from '../src/types.js';

let outDir: string;

beforeEach(async () => {
    outDir = await fs.mkdtemp(path.join(os.tmpdir(), 'md-publisher-epub-'));
});

afterEach(async () => {
    await fs.rm(outDir, { recursive: true, force: true });
});

function publicationWithTocSource(tocSource: boolean): CompiledPublication {
    return {
        name: 'field-notes',
        chapters: [
            {
                sourcePath: '/pub/01-intro.mdpub',
                fileBaseName: '01-intro',
                title: 'Intro',
                tocSource,
                blocks: [
                    { type: 'heading', level: 1, text: 'Intro', slug: 'intro' },
                    { type: 'paragraph', runs: [{ type: 'text', value: 'See ' }, { type: 'link', text: 'Setup', targetSlug: 'setup' }] }
                ]
            },
            {
                sourcePath: '/pub/02-setup.mdpub',
                fileBaseName: '02-setup',
                title: 'Setup',
                tocSource: false,
                blocks: [
                    { type: 'heading', level: 2, text: 'Setup', slug: 'setup' }
                ]
            }
        ]
    };
}

describe('generateEpub', () => {

    test('BR-6: refuses with a BuildTargetViolation when no chapter is marked as the toc source', async () => {
        await expect(generateEpub(publicationWithTocSource(false), outDir)).rejects.toThrow(BuildTargetViolation);
    });

    test('produces a valid EPUB package when a chapter is marked as the toc source', async () => {
        const artifactPath = await generateEpub(publicationWithTocSource(true), outDir);
        expect(artifactPath).toBe(path.join(outDir, 'field-notes.epub'));

        const buffer = await fs.readFile(artifactPath);
        const zip = await JSZip.loadAsync(buffer);

        expect(Object.keys(zip.files)).toEqual(expect.arrayContaining([
            'mimetype',
            'META-INF/container.xml',
            'OEBPS/content.opf',
            'OEBPS/nav.xhtml',
            'OEBPS/chapter0.xhtml',
            'OEBPS/chapter1.xhtml'
        ]));
    });

    test('a cross-reference to a heading in another chapter links to that chapter\'s xhtml file', async () => {
        const artifactPath = await generateEpub(publicationWithTocSource(true), outDir);
        const zip = await JSZip.loadAsync(await fs.readFile(artifactPath));
        const chapter0 = await zip.file('OEBPS/chapter0.xhtml')!.async('string');
        expect(chapter0).toContain('<a href="chapter1.xhtml#setup">Setup</a>');
    });

    test('the spine lists every chapter in Publication order', async () => {
        const artifactPath = await generateEpub(publicationWithTocSource(true), outDir);
        const zip = await JSZip.loadAsync(await fs.readFile(artifactPath));
        const opf = await zip.file('OEBPS/content.opf')!.async('string');
        const chapter0Index = opf.indexOf('idref="chapter0"');
        const chapter1Index = opf.indexOf('idref="chapter1"');
        expect(chapter0Index).toBeGreaterThan(-1);
        expect(chapter1Index).toBeGreaterThan(chapter0Index);
    });
});
