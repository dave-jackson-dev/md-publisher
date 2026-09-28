import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { generateWeb } from '../src/generators/web-generator.js';
import type { CompiledPublication } from '../src/types.js';

let outDir: string;

beforeEach(async () => {
    outDir = await fs.mkdtemp(path.join(os.tmpdir(), 'md-publisher-web-'));
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

describe('generateWeb', () => {

    test('writes an index page and one page per chapter into <outDir>/<name>/', async () => {
        const siteDir = await generateWeb(publication, outDir);
        expect(siteDir).toBe(path.join(outDir, 'user-guide'));

        const files = await fs.readdir(siteDir);
        expect(files.sort()).toEqual(['01-intro.html', '02-setup.html', 'index.html', 'styles.css']);
    });

    test('a cross-reference to another chapter links to that chapter\'s file and anchor', async () => {
        await generateWeb(publication, outDir);
        const introHtml = await fs.readFile(path.join(outDir, 'user-guide', '01-intro.html'), 'utf-8');
        expect(introHtml).toContain('<a href="02-setup.html#setup">Setup</a>');
    });

    test('a heading gets an id matching its slug', async () => {
        await generateWeb(publication, outDir);
        const setupHtml = await fs.readFile(path.join(outDir, 'user-guide', '02-setup.html'), 'utf-8');
        expect(setupHtml).toContain('<h2 id="setup">Setup</h2>');
    });
});
