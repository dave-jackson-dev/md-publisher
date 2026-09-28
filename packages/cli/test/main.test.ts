import { describe, expect, test } from 'vitest';
import { parseTargets } from '../src/main.js';

describe('parseTargets', () => {

    test('parses a single target', () => {
        expect(parseTargets('pdf')).toEqual(['pdf']);
    });

    test('parses a comma-separated list, trimming whitespace and lowercasing', () => {
        expect(parseTargets('docx, PDF ,web,epub')).toEqual(['docx', 'pdf', 'web', 'epub']);
    });

    test('rejects an unknown target, naming it and the valid list', () => {
        expect(() => parseTargets('docx,rtf')).toThrow(/Unknown Build Target\(s\): rtf/);
        expect(() => parseTargets('docx,rtf')).toThrow(/docx, pdf, web, epub/);
    });
});
