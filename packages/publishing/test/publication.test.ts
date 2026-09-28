import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { collectStructureViolations, compilePublication, loadPublication } from '../src/publication.js';

let tempDir: string;

beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'md-publisher-publication-'));
});

afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
});

async function writeFiles(files: Record<string, string>): Promise<void> {
    for (const [name, content] of Object.entries(files)) {
        await fs.writeFile(path.join(tempDir, name), content, 'utf-8');
    }
}

describe('loadPublication', () => {

    test('loads every .mdpub file in the directory, in filename-alphabetical order', async () => {
        await writeFiles({
            '02-chapter-one.mdpub': '# Chapter One\n',
            '01-intro.mdpub': '# Intro\n'
        });

        const publication = await loadPublication(tempDir);

        expect(publication.name).toBe(path.basename(tempDir));
        expect(publication.chapters.map(c => path.basename(c.sourcePath))).toEqual([
            '01-intro.mdpub',
            '02-chapter-one.mdpub'
        ]);
    });

    test('resolves a cross-reference against a heading in a different Document', async () => {
        await writeFiles({
            '01-intro.mdpub': 'See [Setup](#setup) for prerequisites.\n',
            '02-setup.mdpub': '## Setup\n'
        });

        const publication = await loadPublication(tempDir);
        expect(collectStructureViolations(publication)).toHaveLength(0);
    });

    test('collectStructureViolations surfaces a dangling cross-reference with its source file', async () => {
        await writeFiles({
            '01-guide.mdpub': 'See [Setup](#setup) for prerequisites.\n'
        });

        const publication = await loadPublication(tempDir);
        const violations = collectStructureViolations(publication);

        expect(violations).toHaveLength(1);
        expect(path.basename(violations[0].sourcePath)).toBe('01-guide.mdpub');
        expect(violations[0].diagnostic.message).toContain('#setup');
    });

    test('rejects a directory with no .mdpub files', async () => {
        await expect(loadPublication(tempDir)).rejects.toThrow('No .mdpub files found');
    });
});

describe('compilePublication', () => {

    test('compiles every chapter in Publication order', async () => {
        await writeFiles({
            '01-intro.mdpub': '# Intro\n',
            '02-setup.mdpub': '## Setup\n'
        });

        const publication = await loadPublication(tempDir);
        const compiled = compilePublication(publication);

        expect(compiled.chapters.map(c => c.title)).toEqual(['Intro', 'Setup']);
    });
});
