import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { generatePdf } from '../src/generators/pdf-generator.js';
import type { CompiledPublication } from '../src/types.js';

let outDir: string;

beforeEach(async () => {
    outDir = await fs.mkdtemp(path.join(os.tmpdir(), 'md-publisher-pdf-'));
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
                { type: 'paragraph', runs: [{ type: 'text', value: 'Hello world.' }] }
            ]
        }
    ]
};

describe('generatePdf', () => {

    test('produces a valid PDF file at <outDir>/<name>.pdf', async () => {
        const artifactPath = await generatePdf(publication, outDir);
        expect(artifactPath).toBe(path.join(outDir, 'user-guide.pdf'));

        const buffer = await fs.readFile(artifactPath);
        expect(buffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');
    });
});
