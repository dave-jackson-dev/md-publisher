import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { ensureOutputDirIgnored } from '../src/gitignore.js';

let dir: string;

beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'md-publisher-gitignore-'));
});

afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
});

async function readGitignore(): Promise<string> {
    return fs.readFile(path.join(dir, '.gitignore'), 'utf-8');
}

describe('ensureOutputDirIgnored', () => {

    test('creates a .gitignore excluding the output directory when none exists', async () => {
        await ensureOutputDirIgnored(dir, 'dist');
        expect(await readGitignore()).toBe('dist/\n');
    });

    test('appends to an existing .gitignore that does not already cover the output directory', async () => {
        await fs.writeFile(path.join(dir, '.gitignore'), 'node_modules/\n', 'utf-8');
        await ensureOutputDirIgnored(dir, 'dist');
        expect(await readGitignore()).toBe('node_modules/\ndist/\n');
    });

    test('adds a newline first if the existing file has no trailing newline', async () => {
        await fs.writeFile(path.join(dir, '.gitignore'), 'node_modules/', 'utf-8');
        await ensureOutputDirIgnored(dir, 'dist');
        expect(await readGitignore()).toBe('node_modules/\ndist/\n');
    });

    test.each(['dist', 'dist/', '/dist', '/dist/'])('does not duplicate an existing "%s" entry', async (entry) => {
        await fs.writeFile(path.join(dir, '.gitignore'), `${entry}\n`, 'utf-8');
        await ensureOutputDirIgnored(dir, 'dist');
        expect(await readGitignore()).toBe(`${entry}\n`);
    });

    test('does not match a comment or an unrelated entry containing "dist" as a substring', async () => {
        await fs.writeFile(path.join(dir, '.gitignore'), '# dist\nnot-dist/\ndistribution/\n', 'utf-8');
        await ensureOutputDirIgnored(dir, 'dist');
        expect(await readGitignore()).toBe('# dist\nnot-dist/\ndistribution/\ndist/\n');
    });
});
