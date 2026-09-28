import { describe, expect, test } from 'vitest';
import { renderChapterBody } from '../src/generators/html-render.js';
import type { Chapter } from '../src/types.js';

function chapterWithBlocks(blocks: Chapter['blocks']): Chapter {
    return { sourcePath: '/pub/01.mdpub', fileBaseName: '01', title: 'Chapter', tocSource: false, blocks };
}

const noSlugs = new Map<string, number>();
const noHref = () => '';

describe('renderChapterBody', () => {

    test('renders emphasis, strong, and code runs', () => {
        const html = renderChapterBody(
            chapterWithBlocks([{
                type: 'paragraph',
                runs: [
                    { type: 'emphasis', runs: [{ type: 'text', value: 'em' }] },
                    { type: 'strong', runs: [{ type: 'text', value: 'strong' }] },
                    { type: 'code', value: 'code' }
                ]
            }]),
            0, noSlugs, noHref
        );
        expect(html).toBe('<p><em>em</em><strong>strong</strong><code>code</code></p>');
    });

    test('renders an external link and an image', () => {
        const html = renderChapterBody(
            chapterWithBlocks([{
                type: 'paragraph',
                runs: [
                    { type: 'externalLink', text: 'docs', url: 'https://example.com' },
                    { type: 'image', alt: 'a cat', url: 'cat.png' }
                ]
            }]),
            0, noSlugs, noHref
        );
        expect(html).toContain('<a href="https://example.com">docs</a>');
        expect(html).toContain('<img src="cat.png" alt="a cat">');
    });

    test('renders a hard break as <br>', () => {
        const html = renderChapterBody(
            chapterWithBlocks([{ type: 'paragraph', runs: [{ type: 'text', value: 'a' }, { type: 'hardBreak' }, { type: 'text', value: 'b' }] }]),
            0, noSlugs, noHref
        );
        expect(html).toBe('<p>a<br>b</p>');
    });

    test('renders a fenced code block with a language class', () => {
        const html = renderChapterBody(
            chapterWithBlocks([{ type: 'codeBlock', language: 'js', content: 'const x = 1;' }]),
            0, noSlugs, noHref
        );
        expect(html).toBe('<pre><code class="language-js">const x = 1;</code></pre>');
    });

    test('renders a code block with no language with a plain <code>', () => {
        const html = renderChapterBody(
            chapterWithBlocks([{ type: 'codeBlock', language: undefined, content: 'plain' }]),
            0, noSlugs, noHref
        );
        expect(html).toBe('<pre><code>plain</code></pre>');
    });

    test('renders a thematic break as <hr>', () => {
        expect(renderChapterBody(chapterWithBlocks([{ type: 'thematicBreak' }]), 0, noSlugs, noHref)).toBe('<hr>');
    });

    test('renders a nested blockquote', () => {
        const html = renderChapterBody(
            chapterWithBlocks([{
                type: 'blockQuote',
                blocks: [
                    { type: 'paragraph', runs: [{ type: 'text', value: 'outer' }] },
                    { type: 'blockQuote', blocks: [{ type: 'paragraph', runs: [{ type: 'text', value: 'inner' }] }] }
                ]
            }]),
            0, noSlugs, noHref
        );
        expect(html).toContain('<blockquote>');
        expect(html).toContain('<p>outer</p>');
        expect(html).toContain('<p>inner</p>');
        // inner blockquote nested inside outer
        expect(html.indexOf('<blockquote>')).toBeLessThan(html.lastIndexOf('<blockquote>'));
    });

    test('renders a list with a nested sub-list', () => {
        const html = renderChapterBody(
            chapterWithBlocks([{
                type: 'list',
                ordered: false,
                items: [
                    { runs: [{ type: 'text', value: 'first' }], children: [] },
                    {
                        runs: [{ type: 'text', value: 'second' }],
                        children: [{ type: 'list', ordered: false, items: [{ runs: [{ type: 'text', value: 'nested' }], children: [] }] }]
                    }
                ]
            }]),
            0, noSlugs, noHref
        );
        expect(html).toContain('<ul>');
        expect(html).toContain('<li>first</li>');
        expect(html).toContain('<li>nested</li>');
        expect(html).not.toContain('<ol>');
    });

    test('renders an ordered list with <ol>', () => {
        const html = renderChapterBody(
            chapterWithBlocks([{ type: 'list', ordered: true, items: [{ runs: [{ type: 'text', value: 'step' }], children: [] }] }]),
            0, noSlugs, noHref
        );
        expect(html).toContain('<ol>');
        expect(html).toContain('<li>step</li>');
    });
});
