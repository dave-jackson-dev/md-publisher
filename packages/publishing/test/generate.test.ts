import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { generatePublication } from '../src/generate.js';
import type { CompiledPublication } from '../src/types.js';

let outDir: string;

beforeEach(async () => {
    outDir = await fs.mkdtemp(path.join(os.tmpdir(), 'md-publisher-generate-'));
});

afterEach(async () => {
    await fs.rm(outDir, { recursive: true, force: true });
});

const publicationWithoutTocSource: CompiledPublication = {
    name: 'field-notes',
    chapters: [
        {
            sourcePath: '/pub/01-intro.mdpub',
            fileBaseName: '01-intro',
            title: 'Intro',
            tocSource: false,
            blocks: [{ type: 'heading', level: 1, text: 'Intro', slug: 'intro' }]
        }
    ]
};

describe('generatePublication', () => {

    // BR-7: Build Targets are independent — an epub BuildTargetViolation (BR-6) must not stop pdf.
    test('a BuildTargetViolation on one target does not prevent other targets from generating', async () => {
        const outcomes = await generatePublication(publicationWithoutTocSource, ['epub', 'pdf'], outDir);

        const epubOutcome = outcomes.find(o => o.target === 'epub')!;
        expect(epubOutcome.outcome).toBe('build-target-violation');

        const pdfOutcome = outcomes.find(o => o.target === 'pdf')!;
        expect(pdfOutcome.outcome).toBe('generated');
        if (pdfOutcome.outcome === 'generated') {
            await expect(fs.stat(pdfOutcome.artifactPath)).resolves.toBeDefined();
        }
    });

    test('requesting a subset of targets produces only those artifacts', async () => {
        const outcomes = await generatePublication(publicationWithoutTocSource, ['pdf'], outDir);
        expect(outcomes).toHaveLength(1);
        expect(outcomes[0].target).toBe('pdf');

        const files = await fs.readdir(outDir);
        expect(files).toEqual(['field-notes.pdf']);
    });
});
