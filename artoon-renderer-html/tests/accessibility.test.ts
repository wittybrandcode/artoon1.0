import { render } from '../src';

describe('Accessibility and structured data', () => {
  test('adds ARIA labels for media by default', () => {
    const doc: any = {
      version: '2.0',
      content: [
        {
          type: 'media',
          mediaType: 'img',
          src: '/img.png',
          alt: 'Cover image',
          line: 1,
          direction: 'ltr'
        }
      ]
    };

    const html = render(doc, { includeAria: true });
    expect(html).toContain('aria-label="Cover image"');
  });

  test('can disable ARIA attributes', () => {
    const doc: any = {
      version: '2.0',
      content: [
        {
          type: 'media',
          mediaType: 'video',
          src: '/video.mp4',
          title: 'Intro clip',
          line: 1,
          direction: 'ltr'
        }
      ]
    };

    const html = render(doc, { includeAria: false });
    expect(html).not.toContain('aria-label=');
  });

  test('emits JSON-LD when structuredData is enabled in full document mode', () => {
    const doc: any = {
      version: '2.0',
      meta: {
        title: 'ARTOON Test',
        description: 'Structured data check',
        author: 'Team',
        lang: 'en',
        tags: ['artoon', 'test']
      },
      content: [
        {
          type: 'text',
          textType: 'p',
          content: [{ type: 'plain', value: 'Hello world' }],
          line: 1,
          direction: 'ltr'
        }
      ]
    };

    const html = render(doc, { fullDocument: true, structuredData: true });
    expect(html).toContain('<script type="application/ld+json">');
    expect(html).toContain('"@context":"https://schema.org"');
    expect(html).toContain('"@type":"Article"');
    expect(html).toContain('"headline":"ARTOON Test"');
  });
});
