import * as fs from 'node:fs/promises';
import * as path from 'node:path';

/**
 * Feature 10 Scenario 2: BR-8 (Output Artifacts are never committed to source) should hold
 * structurally, not just by a Docs Writer remembering not to `git add dist/`. Ensures the
 * directory `generate` writes output into is excluded from `.gitignore` in the directory the CLI
 * was run from — creating the file if it doesn't exist, appending to it if it exists but doesn't
 * already cover the output directory, and doing nothing if it's already covered (`dist`, `dist/`,
 * `/dist`, or `/dist/` are all recognized). Never touches an unrelated existing entry.
 */
export async function ensureOutputDirIgnored(directory: string, outputDirName: string): Promise<void> {
    const gitignorePath = path.join(directory, '.gitignore');
    const existing = await readIfExists(gitignorePath);

    if (existing !== undefined) {
        const alreadyIgnored = existing.split(/\r?\n/).some(line => matchesOutputDir(line, outputDirName));
        if (alreadyIgnored) {
            return;
        }
        const needsLeadingNewline = existing.length > 0 && !existing.endsWith('\n');
        await fs.writeFile(gitignorePath, `${existing}${needsLeadingNewline ? '\n' : ''}${outputDirName}/\n`, 'utf-8');
        return;
    }

    await fs.writeFile(gitignorePath, `${outputDirName}/\n`, 'utf-8');
}

async function readIfExists(filePath: string): Promise<string | undefined> {
    try {
        return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return undefined;
        }
        throw error;
    }
}

function matchesOutputDir(line: string, outputDirName: string): boolean {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) {
        return false;
    }
    const normalized = trimmed.replace(/^\//, '').replace(/\/$/, '');
    return normalized === outputDirName;
}
