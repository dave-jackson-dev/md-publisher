import { describe, expect, test } from "vitest";
import { collectCrossReferences, parseInline } from "../src/md-publisher-inline.js";

describe('parseInline', () => {

    test('plain text with no inline constructs', () => {
        expect(parseInline('just plain text')).toEqual([
            { type: 'text', value: 'just plain text', start: 0, end: 15 }
        ]);
    });

    test('emphasis with * and _', () => {
        expect(parseInline('a *b* c')).toEqual([
            { type: 'text', value: 'a ', start: 0, end: 2 },
            { type: 'emphasis', children: [{ type: 'text', value: 'b', start: 3, end: 4 }], start: 2, end: 5 },
            { type: 'text', value: ' c', start: 5, end: 7 }
        ]);
        expect(parseInline('a _b_ c')[1]).toMatchObject({ type: 'emphasis' });
    });

    test('strong with ** and __', () => {
        const nodes = parseInline('a **b** c');
        expect(nodes[1]).toMatchObject({ type: 'strong', children: [{ type: 'text', value: 'b' }] });
        expect(parseInline('a __b__ c')[1]).toMatchObject({ type: 'strong' });
    });

    test('a code span', () => {
        expect(parseInline('see `code` here')).toEqual([
            { type: 'text', value: 'see ', start: 0, end: 4 },
            { type: 'code', value: 'code', start: 4, end: 10 },
            { type: 'text', value: ' here', start: 10, end: 15 }
        ]);
    });

    test('a code span containing a literal backtick, using a double-backtick fence', () => {
        const nodes = parseInline('use ``a`b`` here');
        expect(nodes[1]).toEqual({ type: 'code', value: 'a`b', start: 4, end: 11 });
    });

    test('a code span with a single leading/trailing space is trimmed by one space each side', () => {
        const nodes = parseInline('` code `');
        expect(nodes[0]).toEqual({ type: 'code', value: 'code', start: 0, end: 8 });
    });

    test('a single-backtick span skips over an unrelated longer run to find its real closer', () => {
        // A single-backtick opener must not be fooled by a ``` run appearing before the actual
        // closing single backtick (found via examples/user-guide/04-syntax-reference.mdpub,
        // which does exactly this to show a fenced-code-block's own syntax as a code span).
        const nodes = parseInline('a ` ``` ` b');
        expect(nodes[1]).toEqual({ type: 'code', value: '```', start: 2, end: 9 });
    });

    test('a general link (not a cross-reference)', () => {
        const nodes = parseInline('see [the docs](https://example.com) now');
        expect(nodes[1]).toEqual({ type: 'link', text: 'the docs', url: 'https://example.com', start: 4, end: 35 });
    });

    test('a cross-reference (# anchor target)', () => {
        const nodes = parseInline('see [Setup](#setup) now');
        expect(nodes[1]).toEqual({ type: 'crossReference', text: 'Setup', anchor: 'setup', start: 4, end: 19 });
    });

    test('an image', () => {
        const nodes = parseInline('![alt text](image.png)');
        expect(nodes[0]).toEqual({ type: 'image', alt: 'alt text', url: 'image.png', start: 0, end: 22 });
    });

    test('a hard break marker (embedded literal newline)', () => {
        const nodes = parseInline('line one\nline two');
        expect(nodes).toEqual([
            { type: 'text', value: 'line one', start: 0, end: 8 },
            { type: 'hardBreak', start: 8, end: 9 },
            { type: 'text', value: 'line two', start: 9, end: 17 }
        ]);
    });

    test('an unmatched delimiter is left as literal text', () => {
        expect(parseInline('5 * 3 = 15')).toEqual([
            { type: 'text', value: '5 * 3 = 15', start: 0, end: 10 }
        ]);
    });

    test('an unclosed code span backtick is left as literal text', () => {
        expect(parseInline('a `b')).toEqual([
            { type: 'text', value: 'a `b', start: 0, end: 4 }
        ]);
    });

    test('nested cross-reference inside emphasis is found by collectCrossReferences', () => {
        const nodes = parseInline('see *[Setup](#setup)* now');
        const refs = collectCrossReferences(nodes);
        expect(refs).toHaveLength(1);
        expect(refs[0]).toMatchObject({ text: 'Setup', anchor: 'setup' });
    });

    test('collectCrossReferences finds top-level references too, and none when there are none', () => {
        expect(collectCrossReferences(parseInline('[Setup](#setup)'))).toHaveLength(1);
        expect(collectCrossReferences(parseInline('no refs here'))).toHaveLength(0);
    });
});
