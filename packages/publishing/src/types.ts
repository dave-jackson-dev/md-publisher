export type BuildTarget = 'docx' | 'pdf' | 'web' | 'epub';

export const ALL_BUILD_TARGETS: readonly BuildTarget[] = ['docx', 'pdf', 'web', 'epub'];

export interface ChapterHeadingBlock {
    type: 'heading';
    level: number;
    text: string;
    slug: string;
}

export type ParagraphRun =
    | { type: 'text'; value: string }
    /** A same-Publication anchor link — BR-1/BR-4 already guarantee this resolves to exactly one heading. */
    | { type: 'crossReference'; text: string; targetSlug: string }
    /** Any other link (external URL) — distinct from crossReference, which needs no host/target lookup. */
    | { type: 'externalLink'; text: string; url: string }
    | { type: 'emphasis'; runs: ParagraphRun[] }
    | { type: 'strong'; runs: ParagraphRun[] }
    | { type: 'code'; value: string }
    | { type: 'image'; alt: string; url: string }
    | { type: 'hardBreak' };

export interface ChapterParagraphBlock {
    type: 'paragraph';
    runs: ParagraphRun[];
}

export interface ChapterCodeBlock {
    type: 'codeBlock';
    language: string | undefined;
    content: string;
}

export interface ChapterThematicBreakBlock {
    type: 'thematicBreak';
}

export interface ChapterBlockQuoteBlock {
    type: 'blockQuote';
    blocks: ChapterBlock[];
}

export interface ChapterListItem {
    /** The item's own inline content. Multi-paragraph list items aren't supported — see
     * Sprint 2a's plan for why (a documented "practical superset" simplification, not a bug). */
    runs: ParagraphRun[];
    /** Sub-lists indented deeper than this item, appearing immediately after it. */
    children: ChapterListBlock[];
}

export interface ChapterListBlock {
    type: 'list';
    ordered: boolean;
    items: ChapterListItem[];
}

export type ChapterBlock =
    | ChapterHeadingBlock
    | ChapterParagraphBlock
    | ChapterCodeBlock
    | ChapterThematicBreakBlock
    | ChapterBlockQuoteBlock
    | ChapterListBlock;

export interface Chapter {
    /** Absolute path of the source .md or .mdpub file. */
    sourcePath: string;
    /** File name without extension, e.g. "01-intro" from "01-intro.mdpub". Used to name per-chapter output files (Web, EPUB). */
    fileBaseName: string;
    /** The chapter's first heading text, or fileBaseName if it has no heading. */
    title: string;
    /** Whether this chapter's front matter declares `toc: true` (BR-6's EPUB table-of-contents source). */
    tocSource: boolean;
    blocks: ChapterBlock[];
}

/**
 * A Publication ready for generation: every Document has already been parsed and validated
 * with zero Structure Violations (the CLI refuses to reach this point otherwise), compiled into
 * a target-independent intermediate representation. Chapter order is filename-alphabetical order
 * within the Publication directory — see publication.ts.
 */
export interface CompiledPublication {
    /** The Publication directory's basename, used to name output artifacts. */
    name: string;
    chapters: Chapter[];
}

export type GenerationOutcome =
    | { target: BuildTarget; outcome: 'generated'; artifactPath: string }
    | { target: BuildTarget; outcome: 'build-target-violation'; message: string };
