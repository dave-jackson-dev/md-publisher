import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';
import chalk from 'chalk';
import { Command } from 'commander';
import {
    ALL_BUILD_TARGETS,
    collectStructureViolations,
    compilePublication,
    ensureOutputDirIgnored,
    generatePublication,
    loadPublication,
    type BuildTarget
} from 'md-publisher-publishing';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const packagePath = path.resolve(__dirname, '..', 'package.json');
const packageContent = await fs.readFile(packagePath, 'utf-8');

export function parseTargets(value: string): BuildTarget[] {
    const requested = value.split(',').map(t => t.trim().toLowerCase());
    const invalid = requested.filter(t => !(ALL_BUILD_TARGETS as string[]).includes(t));
    if (invalid.length > 0) {
        throw new Error(`Unknown Build Target(s): ${invalid.join(', ')}. Valid targets: ${ALL_BUILD_TARGETS.join(', ')}.`);
    }
    return requested as BuildTarget[];
}

export const generateAction = async (publicationDir: string, options: { targets: string }): Promise<void> => {
    const targets = parseTargets(options.targets);

    const publication = await loadPublication(publicationDir);
    const violations = collectStructureViolations(publication);

    // BR-5: a refused Generation produces no Output Artifact at all, for any target — checked
    // once, up front, before any generator runs. This is distinct from a per-target
    // BuildTargetViolation (BR-6), which only blocks the one target (see below).
    if (violations.length > 0) {
        for (const { sourcePath, diagnostic } of violations) {
            console.error(chalk.red(`✗ Structure Violation in ${path.basename(sourcePath)}`));
            console.error(chalk.red(`  ${diagnostic.message}`));
        }
        console.error(chalk.red('No Output Artifact was produced. Fix the violation and run again.'));
        process.exit(1);
    }

    const compiled = compilePublication(publication);
    const outDir = path.resolve(process.cwd(), 'dist');
    // Feature 10 / BR-8: Output Artifacts are never committed to source, structurally — not left
    // to a Docs Writer remembering to exclude dist/ by hand.
    await ensureOutputDirIgnored(process.cwd(), 'dist');
    // BR-5: an existing Output Artifact at the same destination is silently overwritten — each
    // generator just writes the file, no existence check, no --force flag, no confirmation prompt.
    const outcomes = await generatePublication(compiled, targets, outDir);

    for (const outcome of outcomes) {
        if (outcome.outcome === 'generated') {
            console.log(chalk.green(`✓ ${path.relative(process.cwd(), outcome.artifactPath)}`));
        } else {
            console.error(chalk.yellow(`✗ Build-Target Violation for ${outcome.target}`));
            console.error(chalk.yellow(`  ${outcome.message}`));
        }
    }

    if (outcomes.every(outcome => outcome.outcome === 'build-target-violation')) {
        process.exit(1);
    }
};

export default function (): void {
    const program = new Command();

    program.version(JSON.parse(packageContent).version);

    program
        .command('generate')
        .argument('<publication>', 'path to the Publication directory (a folder of .md or .mdpub Documents)')
        .option('--targets <targets>', `comma-separated Build Targets (${ALL_BUILD_TARGETS.join(', ')})`, ALL_BUILD_TARGETS.join(','))
        .description('Validates a Publication and generates the requested Build Targets into ./dist.')
        .action(generateAction);

    program.parse(process.argv);
}
