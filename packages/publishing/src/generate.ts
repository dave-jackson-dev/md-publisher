import { generateDocx } from './generators/docx-generator.js';
import { generateEpub } from './generators/epub-generator.js';
import { generatePdf } from './generators/pdf-generator.js';
import { generateWeb } from './generators/web-generator.js';
import type { BuildTarget, CompiledPublication, GenerationOutcome } from './types.js';
import { BuildTargetViolation } from './violations.js';

const GENERATORS: Record<BuildTarget, (publication: CompiledPublication, outDir: string) => Promise<string>> = {
    docx: generateDocx,
    pdf: generatePdf,
    web: generateWeb,
    epub: generateEpub
};

/**
 * Runs each requested Build Target independently (BR-7): a BuildTargetViolation from one target
 * (currently only possible for `epub`, BR-6) is reported for that target alone and does not stop
 * the others from being generated. Callers are responsible for refusing the whole Generation
 * beforehand if the Publication has any unresolved Structure Violation — that's a Language-context
 * concern this package doesn't re-check (see packages/language and the CLI's `generate` command).
 */
export async function generatePublication(
    publication: CompiledPublication,
    targets: BuildTarget[],
    outDir: string
): Promise<GenerationOutcome[]> {
    const outcomes: GenerationOutcome[] = [];
    for (const target of targets) {
        try {
            const artifactPath = await GENERATORS[target](publication, outDir);
            outcomes.push({ target, outcome: 'generated', artifactPath });
        } catch (error) {
            if (error instanceof BuildTargetViolation) {
                outcomes.push({ target, outcome: 'build-target-violation', message: error.message });
            } else {
                throw error;
            }
        }
    }
    return outcomes;
}
