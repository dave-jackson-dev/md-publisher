import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { URI, type LangiumDocument } from 'langium';
import { NodeFileSystem } from 'langium/node';
import { createMdPublisherServices, type Document } from 'md-publisher-language';
import type { Diagnostic } from 'vscode-languageserver-types';
import { compileChapter } from './model.js';
import type { CompiledPublication } from './types.js';

export interface ChapterSource {
    sourcePath: string;
    document: Document;
    diagnostics: Diagnostic[];
}

export interface LoadedPublication {
    name: string;
    directory: string;
    chapters: ChapterSource[];
}

/**
 * Loads every `.mdpub` file directly under `directory` as one Publication and validates them
 * together, so BR-1/BR-4's cross-reference resolution (see packages/language) sees the whole
 * Publication rather than one Document in isolation. Chapter order is filename-alphabetical —
 * the workshop docs don't specify a manifest/ordering format, and alphabetical (e.g.
 * `01-intro.mdpub`, `02-setup.mdpub`, ...) is the simplest convention that doesn't require
 * inventing one. This is a Sprint 1b assumption, not a sourced requirement.
 */
export async function loadPublication(directory: string): Promise<LoadedPublication> {
    const absoluteDir = path.resolve(directory);
    const stat = await fs.stat(absoluteDir).catch(() => undefined);
    if (!stat?.isDirectory()) {
        throw new Error(`Publication directory not found: ${absoluteDir}`);
    }

    const fileNames = (await fs.readdir(absoluteDir))
        .filter(fileName => fileName.endsWith('.mdpub'))
        .sort();
    if (fileNames.length === 0) {
        throw new Error(`No .mdpub files found in Publication directory: ${absoluteDir}`);
    }

    const services = createMdPublisherServices(NodeFileSystem).MdPublisher;
    const langiumDocuments: LangiumDocument<Document>[] = [];
    for (const fileName of fileNames) {
        const uri = URI.file(path.join(absoluteDir, fileName));
        langiumDocuments.push(await services.shared.workspace.LangiumDocuments.getOrCreateDocument(uri) as LangiumDocument<Document>);
    }
    await services.shared.workspace.DocumentBuilder.build(langiumDocuments, { validation: true });

    return {
        name: path.basename(absoluteDir),
        directory: absoluteDir,
        chapters: langiumDocuments.map((langiumDocument, i) => ({
            sourcePath: path.join(absoluteDir, fileNames[i]),
            document: langiumDocument.parseResult.value,
            diagnostics: langiumDocument.diagnostics ?? []
        }))
    };
}

/** All Structure Violations across every chapter, or an empty array if the Publication is clean. */
export function collectStructureViolations(publication: LoadedPublication): Array<{ sourcePath: string; diagnostic: Diagnostic }> {
    return publication.chapters.flatMap(chapter =>
        chapter.diagnostics
            .filter(d => d.code === 'structure-violation')
            .map(diagnostic => ({ sourcePath: chapter.sourcePath, diagnostic }))
    );
}

export function compilePublication(publication: LoadedPublication): CompiledPublication {
    return {
        name: publication.name,
        chapters: publication.chapters.map(chapter => compileChapter(chapter.sourcePath, chapter.document))
    };
}
