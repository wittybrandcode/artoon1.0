/**
 * Jest test setup for @artoon/editor-state
 */

// Extend Jest matchers if needed
// import '@testing-library/jest-dom';

// Global test utilities

/**
 * Create a simple test document
 */
export function createTestDoc(content: string = 'مرحباً بالعالم') {
  return {
    version: '1.0' as const,
    content: [
      {
        nodeType: 'text' as const,
        textType: 'p' as const,
        direction: 'rtl' as const,
        line: 1,
        content: [
          { type: 'plain' as const, value: content }
        ]
      }
    ]
  };
}

/**
 * Create a multi-paragraph test document
 */
export function createMultiParagraphDoc() {
  return {
    version: '1.0' as const,
    content: [
      {
        nodeType: 'text' as const,
        textType: 'p' as const,
        direction: 'rtl' as const,
        line: 1,
        content: [
          { type: 'plain' as const, value: 'الفقرة الأولى' }
        ]
      },
      {
        nodeType: 'text' as const,
        textType: 'p' as const,
        direction: 'rtl' as const,
        line: 2,
        content: [
          { type: 'plain' as const, value: 'الفقرة الثانية' }
        ]
      },
      {
        nodeType: 'text' as const,
        textType: 'p' as const,
        direction: 'ltr' as const,
        line: 3,
        content: [
          { type: 'plain' as const, value: 'Third paragraph' }
        ]
      }
    ]
  };
}

/**
 * Create a document with formatted text
 */
export function createFormattedDoc() {
  return {
    version: '1.0' as const,
    content: [
      {
        nodeType: 'text' as const,
        textType: 'p' as const,
        direction: 'rtl' as const,
        line: 1,
        content: [
          { type: 'plain' as const, value: 'نص عادي ' },
          { 
            type: 'inline' as const, 
            modifiers: ['s' as const],
            attributes: {},
            value: 'نص مهم'
          },
          { type: 'plain' as const, value: ' ونص آخر' }
        ]
      }
    ]
  };
}

/**
 * Create a document with headings
 */
export function createHeadingsDoc() {
  return {
    version: '1.0' as const,
    content: [
      {
        nodeType: 'text' as const,
        textType: 't1' as const,
        direction: 'rtl' as const,
        line: 1,
        content: [
          { type: 'plain' as const, value: 'العنوان الرئيسي' }
        ]
      },
      {
        nodeType: 'text' as const,
        textType: 't2' as const,
        direction: 'rtl' as const,
        line: 2,
        content: [
          { type: 'plain' as const, value: 'عنوان فرعي' }
        ]
      },
      {
        nodeType: 'text' as const,
        textType: 'p' as const,
        direction: 'rtl' as const,
        line: 3,
        content: [
          { type: 'plain' as const, value: 'محتوى الفقرة' }
        ]
      }
    ]
  };
}

/**
 * Create a document with a list
 */
export function createListDoc() {
  return {
    version: '1.0' as const,
    content: [
      {
        nodeType: 'list' as const,
        listType: 'ul' as const,
        direction: 'rtl' as const,
        line: 1,
        items: [
          {
            itemType: 'li' as const,
            content: [{ type: 'plain' as const, value: 'عنصر أول' }]
          },
          {
            itemType: 'li' as const,
            content: [{ type: 'plain' as const, value: 'عنصر ثاني' }]
          },
          {
            itemType: 'li' as const,
            content: [{ type: 'plain' as const, value: 'عنصر ثالث' }]
          }
        ]
      }
    ]
  };
}

// Silence console during tests if needed
// beforeAll(() => {
//   jest.spyOn(console, 'warn').mockImplementation(() => {});
// });

// afterAll(() => {
//   jest.restoreAllMocks();
// });
