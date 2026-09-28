import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import JSZip from 'jszip';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { generateDocx } from '../src/generators/docx-generator.js';
import type { CompiledPublication } from '../src/types.js';

let outDir: string;

beforeEach(async () => {
    outDir = await fs.mkdtemp(path.join(os.tmpdir(), 'md-publisher-docx-'));
});

afterEach(async () => {
    await fs.rm(outDir, { recursive: true, force: true });
});

const publication: CompiledPublication = {
    name: 'user-guide',
    chapters: [
        {
            sourcePath: '/pub/01-intro.mdpub',
            fileBaseName: '01-intro',
            title: 'Intro',
            tocSource: false,
            blocks: [
                { type: 'heading', level: 1, text: 'Intro', slug: 'intro' },
                { type: 'paragraph', runs: [{ type: 'text', value: 'See ' }, { type: 'crossReference', text: 'Setup', targetSlug: 'setup' }] }
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

describe('generateDocx', () => {

    test('produces a valid .docx (zip) at <outDir>/<name>.docx', async () => {
        const artifactPath = await generateDocx(publication, outDir);
        expect(artifactPath).toBe(path.join(outDir, 'user-guide.docx'));

        const zip = await JSZip.loadAsync(await fs.readFile(artifactPath));
        expect(zip.files['word/document.xml']).toBeDefined();
    });

    test('a heading becomes a bookmark and a cross-reference becomes an internal hyperlink to it', async () => {
        const artifactPath = await generateDocx(publication, outDir);
        const zip = await JSZip.loadAsync(await fs.readFile(artifactPath));
        const documentXml = await zip.file('word/document.xml')!.async('string');

        expect(documentXml).toContain('w:name="setup"');
        expect(documentXml).toContain('w:anchor="setup"');
    });
});
