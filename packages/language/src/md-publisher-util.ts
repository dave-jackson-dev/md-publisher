const CROSS_REF_PATTERN = /^\[([^\]]+)\]\(#([^)]+)\)$/;
const HEADING_PATTERN = /^(#{1,6}) (.*)$/;

export interface ParsedCrossReference {
    text: string;
    anchor: string;
}

export function parseCrossReference(raw: string): ParsedCrossReference {
    const match = CROSS_REF_PATTERN.exec(raw);
    if (!match) {
        throw new Error(`Not a valid cross-reference: ${raw}`);
    }
    return { text: match[1], anchor: match[2] };
}

export interface ParsedHeading {
    level: number;
    text: string;
}

export function parseHeading(raw: string): ParsedHeading {
    const match = HEADING_PATTERN.exec(raw);
    if (!match) {
        throw new Error(`Not a valid heading: ${raw}`);
    }
    return { level: match[1].length, text: match[2].trim() };
}

/**
 * GitHub-style heading anchor slug: lowercase, non-alphanumeric (other than spaces and
 * hyphens) stripped, spaces collapsed to hyphens. Per BR-4, colliding slugs are a
 * Structure Violation rather than being auto-disambiguated (no GitHub-style `-1` suffix).
 */
export function slugify(text: string): string {
    return text
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
}
