import type { BuildTarget } from './types.js';

/**
 * BR-6: a Build Target with a structural requirement beyond generic (Language-context)
 * validation — e.g. EPUB needs a chapter marked as its table-of-contents source. Distinct from
 * a Structure Violation: it blocks only the one Build Target, not the whole Generation (BR-7,
 * Build Targets are independent).
 */
export class BuildTargetViolation extends Error {
    constructor(public readonly target: BuildTarget, message: string) {
        super(message);
        this.name = 'BuildTargetViolation';
    }
}
