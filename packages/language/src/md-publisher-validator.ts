import { AstUtils, type AstNode, type ValidationAcceptor, type ValidationChecks } from 'langium';
import type { Range } from 'vscode-languageserver-types';
import {
    isBlockQuoteLine,
    isDocument,
    isHeading,
    isListItemLine,
    isTextLine,
    type BlockQuoteLine,
    type Document,
    type Heading,
    type ListItemLine,
    type MdPublisherAstType,
    type TextLine
} from './generated/ast.js';
import type { MdPublisherServices } from './md-publisher-module.js';
import { collectCrossReferences, parseInline } from './md-publisher-inline.js';
import { parseBlockQuoteLine, parseHeading, parseListItemLine, slugify } from './md-publisher-util.js';

const STRUCTURE_VIOLATION = 'structure-violation';

export function registerValidationChecks(services: MdPublisherServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.MdPublisherValidator;
    const checks: ValidationChecks<MdPublisherAstType> = {
        Document: validator.checkDocument.bind(validator)
    };
    registry.register(checks, validator);
}

interface InlineHost {
    element: TextLine | BlockQuoteLine | ListItemLine;
    /** The element's own inline content, with any block-level marker/indent already stripped. */
    content: string;
    /** How many characters of `element.raw` precede `content` — needed to compute absolute ranges. */
    prefixLength: number;
}

/**
 * Implements the Structure Violation checks from Iteration 01's domain storytelling that still
 * apply after Sprint 2a's CommonMark grammar expansion — BR-1 and BR-4 (cross-references) and
 * BR-3 (heading level skips). BR-2 (front matter position) is retired: see
 * docs/planning/md-publisher/iterations/01/08-mvp-plan.md's Finding 3 for why.
 */
export class MdPublisherValidator {

    constructor(private readonly services: MdPublisherServices) { }

    checkDocument(document: Document, accept: ValidationAcceptor): void {
        this.checkHeadingLevelSkips(document, accept);
        this.checkCrossReferences(document, accept);
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
    // not just the Document being validated. Cross-references can now appear inside plain
    // paragraphs, blockquote lines, or list items (not just top-level paragraphs, as in Sprint
    // 1a) — inlineHosts() covers all three.
    private checkCrossReferences(document: Document, accept: ValidationAcceptor): void {
        const headingsBySlug = this.collectPublicationHeadingSlugs(document);

        for (const host of inlineHosts(document)) {
            const inlineNodes = parseInline(host.content);
            for (const crossReference of collectCrossReferences(inlineNodes)) {
                const range = absoluteRange(host, crossReference.start, crossReference.end);
                const matches = headingsBySlug.get(crossReference.anchor) ?? [];
                if (matches.length === 0) {
                    accept('error', `Heading "#${crossReference.anchor}" not found in this Publication`, {
                        node: host.element,
                        range,
                        code: STRUCTURE_VIOLATION
                    });
                } else if (matches.length > 1) {
                    accept('error', `Cross-reference target "#${crossReference.anchor}" is ambiguous: ${matches.length} headings in this Publication resolve to it.`, {
                        node: host.element,
                        range,
                        code: STRUCTURE_VIOLATION
                    });
                }
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
     * not per-Document. Directory-wide Publication loading is packages/publishing's concern;
     * this relies on whatever the host (CLI, LSP, or a test) has already loaded into the
     * workspace.
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

/** Every element in the Document whose raw text carries inline content worth scanning. */
function* inlineHosts(document: Document): Generator<InlineHost> {
    for (const element of document.elements) {
        if (isTextLine(element)) {
            yield { element, content: element.raw, prefixLength: 0 };
        } else if (isBlockQuoteLine(element)) {
            const parsed = parseBlockQuoteLine(element.raw);
            yield { element, content: parsed.content, prefixLength: element.raw.length - parsed.content.length };
        } else if (isListItemLine(element)) {
            const parsed = parseListItemLine(element.raw);
            yield { element, content: parsed.content, prefixLength: element.raw.length - parsed.content.length };
        }
        // Heading and FencedCodeBlock are deliberately not inline-parsed — see md-publisher.langium.
    }
}

function absoluteRange(host: InlineHost, relativeStart: number, relativeEnd: number): Range {
    const node = host.element as AstNode;
    const cstNode = node.$cstNode;
    if (!cstNode) {
        throw new Error('Cannot compute a diagnostic range for a node with no CST.');
    }
    const document = AstUtils.getDocument(node);
    const base = cstNode.offset + host.prefixLength;
    return {
        start: document.textDocument.positionAt(base + relativeStart),
        end: document.textDocument.positionAt(base + relativeEnd)
    };
}
