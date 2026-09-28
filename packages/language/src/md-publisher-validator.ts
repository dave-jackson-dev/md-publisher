import type { ValidationAcceptor, ValidationChecks } from 'langium';
import { isCrossReference, isFrontMatter, isHeading, isDocument, type Document, type Heading, type MdPublisherAstType } from './generated/ast.js';
import type { MdPublisherServices } from './md-publisher-module.js';
import { parseCrossReference, parseHeading, slugify } from './md-publisher-util.js';

const STRUCTURE_VIOLATION = 'structure-violation';

export function registerValidationChecks(services: MdPublisherServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.MdPublisherValidator;
    const checks: ValidationChecks<MdPublisherAstType> = {
        Document: validator.checkDocument.bind(validator)
    };
    registry.register(checks, validator);
}

/**
 * Implements the Structure Violation checks from Iteration 01's domain storytelling
 * (BR-1..BR-4) — the only Language-context validations in Sprint 1a's scope. All four
 * raise the same diagnostic kind (`structure-violation`), distinguished by message only,
 * per the frozen vocabulary (see docs/planning/md-publisher/iterations/01/04-domain-storytelling.md).
 */
export class MdPublisherValidator {

    constructor(private readonly services: MdPublisherServices) { }

    checkDocument(document: Document, accept: ValidationAcceptor): void {
        this.checkFrontMatterPosition(document, accept);
        this.checkHeadingLevelSkips(document, accept);
        this.checkCrossReferences(document, accept);
    }

    // BR-2: a Document's front matter must appear before any content.
    private checkFrontMatterPosition(document: Document, accept: ValidationAcceptor): void {
        const index = document.elements.findIndex(isFrontMatter);
        if (index > 0) {
            accept('error', 'Front matter must appear before any content in this Document.', {
                node: document.elements[index],
                code: STRUCTURE_VIOLATION
            });
        }
    }

    // BR-3: heading levels may not skip a level (e.g. H1 directly to H3).
    private checkHeadingLevelSkips(document: Document, accept: ValidationAcceptor): void {
        let previousLevel: number | undefined;
        for (const element of document.elements) {
            if (!isHeading(element)) {
                continue;
            }
            const { level } = parseHeading(element.raw);
            if (previousLevel !== undefined && level - previousLevel > 1) {
                const skippedLevel = previousLevel + 1;
                accept('error', `Heading level jumps from H${previousLevel} to H${level}, skipping H${skippedLevel}.`, {
                    node: element,
                    code: STRUCTURE_VIOLATION
                });
            }
            previousLevel = level;
        }
    }

    // BR-1 (dangling target) and BR-4 (ambiguous target, same anchor from >1 heading),
    // resolved across every Document currently loaded in the same Publication/workspace,
    // not just the Document being validated.
    private checkCrossReferences(document: Document, accept: ValidationAcceptor): void {
        const headingsBySlug = this.collectPublicationHeadingSlugs(document);

        for (const element of document.elements) {
            if (!isCrossReference(element)) {
                continue;
            }
            const { anchor } = parseCrossReference(element.raw);
            const matches = headingsBySlug.get(anchor.toLowerCase()) ?? [];
            if (matches.length === 0) {
                accept('error', `Heading "#${anchor}" not found in this Publication`, {
                    node: element,
                    code: STRUCTURE_VIOLATION
                });
            } else if (matches.length > 1) {
                accept('error', `Cross-reference target "#${anchor}" is ambiguous: ${matches.length} headings in this Publication resolve to it.`, {
                    node: element,
                    code: STRUCTURE_VIOLATION
                });
            }
        }

        for (const [slug, matches] of headingsBySlug) {
            if (matches.length < 2) {
                continue;
            }
            for (const heading of matches) {
                if (!document.elements.includes(heading)) {
                    continue;
                }
                accept('error', `Heading anchor "#${slug}" is ambiguous: another heading in this Publication resolves to the same anchor.`, {
                    node: heading,
                    code: STRUCTURE_VIOLATION
                });
            }
        }
    }

    private collectPublicationHeadingSlugs(currentDocument: Document): Map<string, Heading[]> {
        const bySlug = new Map<string, Heading[]>();
        for (const publicationDocument of this.publicationDocuments(currentDocument)) {
            for (const element of publicationDocument.elements) {
                if (!isHeading(element)) {
                    continue;
                }
                const slug = slugify(parseHeading(element.raw).text);
                const matches = bySlug.get(slug) ?? [];
                matches.push(element);
                bySlug.set(slug, matches);
            }
        }
        return bySlug;
    }

    /**
     * Every Document currently loaded in the shared workspace, standing in for "the whole
     * Publication" — cross-reference/anchor resolution (BR-1, BR-4) is Publication-scoped,
     * not per-Document. Directory-wide Publication loading is Sprint 1b/T9's concern; this
     * relies on whatever the host (CLI, LSP, or a test) has already loaded into the workspace.
     */
    private publicationDocuments(currentDocument: Document): Document[] {
        const result: Document[] = [];
        for (const langiumDocument of this.services.shared.workspace.LangiumDocuments.all) {
            const value = langiumDocument.parseResult.value;
            if (isDocument(value)) {
                result.push(value);
            }
        }
        if (!result.includes(currentDocument)) {
            result.push(currentDocument);
        }
        return result;
    }
}
