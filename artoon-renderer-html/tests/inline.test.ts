// ARTOON HTML Renderer - Inline Components Tests

import { parse } from '@artoon/parser';
import { transform } from '@artoon/ast';
import { render } from '../src';

describe('Links', () => {
  
  test('simple link', () => {
    const source = '>.p:: رابط [a:: https://example.com; موقع]';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<a href="https://example.com">موقع</a>');
  });
  
  test('link with modifier', () => {
    const source = '>.p:: رابط [s+a:: https://example.com; موقع مهم]';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<strong>');
    expect(html).toContain('<a href="https://example.com">');
    expect(html).toContain('موقع مهم');
  });
  
});

describe('Images', () => {
  
  test('simple image', () => {
    const source = '>.p:: صورة [img:: photo.jpg]';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<img');
    expect(html).toContain('src="photo.jpg"');
  });
  
  test('image with alt', () => {
    const source = '>.p:: صورة [img:: photo.jpg; وصف الصورة]';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('alt="وصف الصورة"');
  });
  
});

describe('Media', () => {
  
  test('audio', () => {
    const source = '>.p:: صوت [audio:: sound.mp3]';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<audio');
    expect(html).toContain('src="sound.mp3"');
    expect(html).toContain('controls');
  });
  
  test('video', () => {
    const source = '>.p:: فيديو [video:: video.mp4]';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<video');
    expect(html).toContain('src="video.mp4"');
    expect(html).toContain('controls');
  });
  
});

describe('Abbreviation', () => {
  
  test('abbr', () => {
    const source = '>.p:: استخدم [abbr:: HTML; HyperText Markup Language]';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<abbr');
    expect(html).toContain('title="HyperText Markup Language"');
    expect(html).toContain('>HTML</abbr>');
  });
  
});

describe('Time', () => {
  
  test('time with datetime', () => {
    const source = '>.p:: التاريخ [time:: 2026-01-06; السادس من يناير]';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<time');
    expect(html).toContain('datetime="2026-01-06"');
    expect(html).toContain('>السادس من يناير</time>');
  });
  
});

describe('Inline Code', () => {
  
  test('code', () => {
    const source = '>.p:: استخدم [c:: console.log()]';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<code>console.log()</code>');
  });
  
  test('code with language', () => {
    const source = '>.p:: استخدم [c:: const x = 1; js]';
    const doc = transform(parse(source));
    const html = render(doc);
    
    expect(html).toContain('<code');
    expect(html).toContain('class="language-js"');
  });
  
});
