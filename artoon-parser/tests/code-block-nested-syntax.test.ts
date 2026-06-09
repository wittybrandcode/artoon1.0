/**
 * Code Block with Nested ARTOON Syntax Tests
 * 
 * Tests that code blocks correctly handle ARTOON syntax as raw content,
 * including block start/end markers that should NOT be interpreted.
 */

import { parse } from '../src';

describe('Code Block with Nested ARTOON Syntax', () => {
  test('should handle META block syntax inside code block', () => {
    const input = `<code:artoon>.
<meta>.
>.-:title: Example
>.-:author: Test
.<meta>
.<code>`;
    
    const result = parse(input);
    
    // Should have NO errors
    expect(result.errors).toHaveLength(0);
    
    // Should have one code block
    expect(result.ast.children).toHaveLength(1);
    const codeBlock = result.ast.children[0] as any;
    expect(codeBlock.type).toBe('block');
    expect(codeBlock.blockName).toBe('code');
    
    // Content should be raw text (not parsed)
    expect(typeof codeBlock.content).toBe('string');
    expect(codeBlock.content).toContain('<meta>.');
    expect(codeBlock.content).toContain('>.-:title: Example');
    expect(codeBlock.content).toContain('.<meta>');
  });

  test('should handle custom block syntax inside code block', () => {
    const input = `<code:artoon>.
<card>.
>.t1:: Title
>.p:: Content
.<card>
.<code>`;
    
    const result = parse(input);
    
    // Should have NO errors
    expect(result.errors).toHaveLength(0);
    
    // Content should contain the raw syntax
    const codeBlock = result.ast.children[0] as any;
    expect(codeBlock.content).toContain('<card>.');
    expect(codeBlock.content).toContain('.<card>');
  });

  test('should handle multiple nested blocks inside code block', () => {
    const input = `<code:artoon>.
<meta>.
>.-:title: Test
.<meta>

<figure>.
>.-img:: image.jpg
>.-figcaption:: Caption
.<figure>
.<code>`;
    
    const result = parse(input);
    
    // Should have NO errors
    expect(result.errors).toHaveLength(0);
    
    // All content should be raw
    const codeBlock = result.ast.children[0] as any;
    expect(codeBlock.content).toContain('<meta>.');
    expect(codeBlock.content).toContain('.<meta>');
    expect(codeBlock.content).toContain('<figure>.');
    expect(codeBlock.content).toContain('.<figure>');
  });

  test('should handle code block with wrong closing tag inside', () => {
    const input = `<code:artoon>.
<meta>.
>.-:title: Test
.<figure>
.<code>`;
    
    const result = parse(input);
    
    // Should have NO errors (.<figure> is just raw content)
    expect(result.errors).toHaveLength(0);
    
    // Content should contain the "wrong" closing tag as raw text
    const codeBlock = result.ast.children[0] as any;
    expect(codeBlock.content).toContain('.<figure>');
  });

  test('should only close on correct block end', () => {
    const input = `<code:artoon>.
.<meta>
.<figure>
.<custom>
.<code>`;
    
    const result = parse(input);
    
    // Should have NO errors
    expect(result.errors).toHaveLength(0);
    
    // All closing tags except .<code> should be raw content
    const codeBlock = result.ast.children[0] as any;
    expect(codeBlock.content).toContain('.<meta>');
    expect(codeBlock.content).toContain('.<figure>');
    expect(codeBlock.content).toContain('.<custom>');
    expect(codeBlock.content).not.toContain('.<code>'); // This one closes the block
  });

  test('should handle real-world example from meta-block-example.artoon', () => {
    const input = `>.t2:: الصيغة

<code:artoon>.
<meta>.
>.-:fieldname: value
>.-:another: value
.<meta>
.<code>

>.t2:: الحقول الشائعة`;
    
    const result = parse(input);
    
    // Should have NO errors
    expect(result.errors).toHaveLength(0);
    
    // Should have 3 nodes: heading, code block, heading
    expect(result.ast.children).toHaveLength(3);
    
    // Check code block
    const codeBlock = result.ast.children[1] as any;
    expect(codeBlock.type).toBe('block');
    expect(codeBlock.blockName).toBe('code');
    expect(codeBlock.lang).toBe('artoon');
    
    // Content should be raw
    expect(codeBlock.content).toContain('<meta>.');
    expect(codeBlock.content).toContain('>.-:fieldname: value');
    expect(codeBlock.content).toContain('.<meta>');
  });
});
