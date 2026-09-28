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
    | { type: 'link'; text: string; targetSlug: string };

export interface ChapterParagraphBlock {
    type: 'paragraph';
    runs: ParagraphRun[];
}

export type ChapterBlock = ChapterHeadingBlock | ChapterParagraphBlock;

export interface Chapter {
    /** Absolute path of the source .mdpub file. */
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
