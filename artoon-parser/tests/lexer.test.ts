// ARTOON Lexer Tests

import { tokenizeLine, tokenize } from '../src/lexer';

describe('Lexer - Basic Tokenization', () => {
  
  test('empty line', () => {
    const token = tokenizeLine('', 1);
    expect(token.line).toBe(1);
    expect(token.hasComponent).toBe(false);
    expect(token.content).toBe('');
  });
  
  test('RTL direction marker', () => {
    const token = tokenizeLine('>.p:: نص', 1);
    expect(token.direction).toBe('rtl');
    expect(token.hasComponent).toBe(true);
    expect(token.componentType).toBe('p');
    expect(token.content).toBe('نص');
  });
  
  test('LTR direction marker', () => {
    const token = tokenizeLine('<.p:: text', 1);
    expect(token.direction).toBe('ltr');
    expect(token.hasComponent).toBe(true);
    expect(token.componentType).toBe('p');
    expect(token.content).toBe('text');
  });
  
  test('heading components t1-t6', () => {
    for (let i = 1; i <= 6; i++) {
      const token = tokenizeLine(`>.t${i}:: عنوان`, 1);
      expect(token.componentType).toBe(`t${i}`);
    }
  });
  
});

describe('Lexer - Structural Symbols', () => {
  
  test('separator :: with space', () => {
    const token = tokenizeLine('>.p:: محتوى', 1);
    expect(token.separator).toBe('::');
    expect(token.content).toBe('محتوى');
  });
  
  test('separator components (no ::)', () => {
    const token = tokenizeLine('>.br', 1);
    expect(token.componentType).toBe('br');
    expect(token.separator).toBeNull();
    expect(token.content).toBe('');
  });
  
  test('combined separators br;hr;br', () => {
    const token = tokenizeLine('>.br;hr;br', 1);
    expect(token.componentType).toBe('br;hr;br');
  });
  
  test('depth with dashes', () => {
    // List items: dashes come before component type (no direction marker needed for items)
    // Format: li::, -li::, --li:: (items inherit direction from parent list)
    // But when using full syntax: >.-li:: means depth 1
    expect(tokenizeLine('li:: item', 1).depth).toBe(0);
    expect(tokenizeLine('-li:: item', 1).depth).toBe(1);
    expect(tokenizeLine('--li:: item', 1).depth).toBe(2);
    expect(tokenizeLine('---li:: item', 1).depth).toBe(3);
  });
  
});

describe('Lexer - Child Elements', () => {
  
  test('child element >.-', () => {
    const token = tokenizeLine('>.-img:: photo.jpg', 1);
    expect(token.isChildElement).toBe(true);
    expect(token.componentType).toBe('img');
    expect(token.content).toBe('photo.jpg');
  });
  
  test('child element <.-', () => {
    const token = tokenizeLine('<.-caption:: description', 1);
    expect(token.isChildElement).toBe(true);
    expect(token.direction).toBe('ltr');
    expect(token.componentType).toBe('caption');
  });
  
});

describe('Lexer - Blocks', () => {
  
  test('block start <name>.', () => {
    const token = tokenizeLine('<meta>.', 1);
    expect(token.isBlockStart).toBe(true);
    expect(token.blockName).toBe('meta');
    expect(token.blockLang).toBeNull();
  });
  
  test('block start with language <code:js>.', () => {
    const token = tokenizeLine('<code:js>.', 1);
    expect(token.isBlockStart).toBe(true);
    expect(token.blockName).toBe('code');
    expect(token.blockLang).toBe('js');
  });
  
  test('block end .<name>', () => {
    const token = tokenizeLine('.<meta>', 1);
    expect(token.isBlockEnd).toBe(true);
    expect(token.blockName).toBe('meta');
  });
  
});

describe('Lexer - Comments', () => {
  
  test('comment >.:::', () => {
    const token = tokenizeLine('>.::: هذا تعليق', 1);
    expect(token.isComment).toBe(true);
    expect(token.content).toBe('هذا تعليق');
  });
  
});

describe('Lexer - List Containers', () => {
  
  test('ul container', () => {
    const token = tokenizeLine('>.ul::', 1);
    expect(token.componentType).toBe('ul');
  });
  
  test('ol container', () => {
    const token = tokenizeLine('>.ol::', 1);
    expect(token.componentType).toBe('ol');
  });
  
  test('dl container', () => {
    const token = tokenizeLine('>.dl::', 1);
    expect(token.componentType).toBe('dl');
  });
  
});

describe('Lexer - Full Document', () => {
  
  test('tokenize multiple lines', () => {
    const source = `>.t1:: عنوان
>.p:: فقرة
>.br
<.p:: English paragraph`;
    
    const tokens = tokenize(source);
    
    expect(tokens).toHaveLength(4);
    expect(tokens[0].componentType).toBe('t1');
    expect(tokens[1].componentType).toBe('p');
    expect(tokens[2].componentType).toBe('br');
    expect(tokens[3].direction).toBe('ltr');
  });
  
});
