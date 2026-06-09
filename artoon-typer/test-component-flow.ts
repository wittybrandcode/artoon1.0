/**
 * Component Flow Diagnostic Tool
 * 
 * Tests each component type through the entire flow:
 * ARTOON Text → Parser → Importer → Editor → Exporter → Renderer
 */

import { parse } from '@artoon/parser';
import { serialize } from '@artoon/serializer';
import { renderDocument } from '@artoon/renderer-html';
import { ARTOONImporter } from './src/integration/ARTOONImporter';
import { ARTOONExporter } from './src/integration/ARTOONExporter';
import { getDefaultRegistry } from './src/core/BlockRegistry';
import type { BlockType } from './src/types';

interface ComponentTest {
  name: string;
  nameAr: string;
  artoonText: string;
  expectedBlockType: BlockType;
  category: string;
}

const tests: ComponentTest[] = [
  // Text Components
  {
    name: 'Paragraph',
    nameAr: 'فقرة',
    artoonText: '>.p:: هذه فقرة اختبار',
    expectedBlockType: 'paragraph',
    category: 'text',
  },
  {
    name: 'Heading 1',
    nameAr: 'عنوان 1',
    artoonText: '>.t1:: عنوان رئيسي',
    expectedBlockType: 'heading1',
    category: 'text',
  },
  {
    name: 'Quote',
    nameAr: 'اقتباس',
    artoonText: '>.q:: اقتباس مهم',
    expectedBlockType: 'quote',
    category: 'text',
  },
  
  // Lists
  {
    name: 'Bullet List',
    nameAr: 'قائمة نقطية',
    artoonText: '>.ul::\n  - عنصر 1\n  - عنصر 2',
    expectedBlockType: 'bullet-list',
    category: 'list',
  },
  {
    name: 'Numbered List',
    nameAr: 'قائمة مرقمة',
    artoonText: '>.ol::\n  1. عنصر أول\n  2. عنصر ثاني',
    expectedBlockType: 'numbered-list',
    category: 'list',
  },
  {
    name: 'Definition List',
    nameAr: 'قائمة تعريفات',
    artoonText: '>.dl::\n  : مصطلح\n  :: تعريف',
    expectedBlockType: 'definition-list',
    category: 'list',
  },
  
  // Media
  {
    name: 'Image',
    nameAr: 'صورة',
    artoonText: '>.img:: https://example.com/image.jpg; صورة اختبار',
    expectedBlockType: 'image',
    category: 'media',
  },
  {
    name: 'Video',
    nameAr: 'فيديو',
    artoonText: '>.video:: https://example.com/video.mp4',
    expectedBlockType: 'video',
    category: 'media',
  },
  
  // Advanced
  {
    name: 'Code',
    nameAr: 'كود',
    artoonText: '>.code:: javascript\nconsole.log("test");\n>.',
    expectedBlockType: 'code',
    category: 'advanced',
  },
  {
    name: 'Table',
    nameAr: 'جدول',
    artoonText: '>.table::\n| العمود 1 | العمود 2 |\n|---------|----------|\n| قيمة 1  | قيمة 2   |\n>.',
    expectedBlockType: 'table',
    category: 'advanced',
  },
  {
    name: 'Divider',
    nameAr: 'فاصل',
    artoonText: '>.sep:: hr',
    expectedBlockType: 'divider',
    category: 'advanced',
  },
  
  // Special Blocks
  {
    name: 'Meta',
    nameAr: 'بيانات وصفية',
    artoonText: '>.meta::\n  title: عنوان\n  author: مؤلف\n>.',
    expectedBlockType: 'meta',
    category: 'advanced',
  },
  {
    name: 'Figure',
    nameAr: 'شكل',
    artoonText: '>.figure::\n  >.img:: https://example.com/image.jpg; صورة\n  >.p:: تعليق\n>.',
    expectedBlockType: 'figure',
    category: 'media',
  },
  {
    name: 'Details',
    nameAr: 'محتوى قابل للطي',
    artoonText: '>.details::\n  >.p:: ملخص\n  >.p:: محتوى\n>.',
    expectedBlockType: 'details',
    category: 'advanced',
  },
  {
    name: 'Time Block',
    nameAr: 'تاريخ/وقت',
    artoonText: '>.time:: 2026-01-18; 18 يناير 2026',
    expectedBlockType: 'time-block',
    category: 'advanced',
  },
  {
    name: 'Abbreviation Block',
    nameAr: 'اختصار',
    artoonText: '>.abbr:: HTML; HyperText Markup Language',
    expectedBlockType: 'abbr-block',
    category: 'advanced',
  },
  
  // Link Block - المشكلة!
  {
    name: 'Link Block',
    nameAr: 'رابط كبلوك',
    artoonText: '>.a:: https://github.com; موقع GitHub',
    expectedBlockType: 'link-block',
    category: 'advanced',
  },
  
  // Custom Block
  {
    name: 'Custom Block',
    nameAr: 'بلوك مخصص',
    artoonText: '>.custom:: callout\n  >.p:: محتوى مخصص\n>.',
    expectedBlockType: 'custom',
    category: 'advanced',
  },
];

interface TestResult {
  test: ComponentTest;
  parserType: string | null;
  importerType: string | null;
  registryExists: boolean;
  exporterOutput: string | null;
  rendererOutput: string | null;
  success: boolean;
  failurePoint: string | null;
}

function testComponent(test: ComponentTest): TestResult {
  const result: TestResult = {
    test,
    parserType: null,
    importerType: null,
    registryExists: false,
    exporterOutput: null,
    rendererOutput: null,
    success: false,
    failurePoint: null,
  };
  
  try {
    // 1. Parser
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${test.name} (${test.nameAr})`);
    console.log(`${'='.repeat(60)}`);
    console.log('Input ARTOON:', test.artoonText.substring(0, 50) + '...');
    
    const doc = parse(test.artoonText);
    if (doc.content && doc.content.length > 0) {
      const node = doc.content[0];
      result.parserType = (node as any).type || (node as any).nodeType || 'unknown';
      console.log('✓ Parser output type:', result.parserType);
    } else {
      result.failurePoint = 'Parser';
      console.log('✗ Parser: No content');
      return result;
    }
    
    // 2. Importer
    const importer = new ARTOONImporter();
    const blocks = importer.import(doc);
    if (blocks && blocks.length > 0) {
      result.importerType = blocks[0].type;
      console.log('✓ Importer output type:', result.importerType);
    } else {
      result.failurePoint = 'Importer';
      console.log('✗ Importer: No blocks');
      return result;
    }
    
    // 3. Registry
    const registry = getDefaultRegistry();
    result.registryExists = registry.has(test.expectedBlockType);
    console.log('✓ Registry has type:', result.registryExists ? 'Yes' : 'No');
    
    // 4. Exporter
    const exporter = new ARTOONExporter();
    const exported = exporter.export(blocks);
    result.exporterOutput = exported.substring(0, 100);
    console.log('✓ Exporter output:', result.exporterOutput + '...');
    
    // 5. Renderer
    const reDoc = parse(exported);
    const html = renderDocument(reDoc, { fullDocument: false });
    result.rendererOutput = html.substring(0, 100);
    console.log('✓ Renderer output:', result.rendererOutput + '...');
    
    // 6. Check success
    result.success = result.importerType === test.expectedBlockType;
    
    if (result.success) {
      console.log('✅ SUCCESS: Component works end-to-end');
    } else {
      result.failurePoint = 'Type Mismatch';
      console.log(`❌ FAILURE: Expected '${test.expectedBlockType}', got '${result.importerType}'`);
    }
    
  } catch (error) {
    result.failurePoint = 'Exception';
    console.log('❌ EXCEPTION:', (error as Error).message);
  }
  
  return result;
}

function generateReport(results: TestResult[]) {
  console.log('\n\n');
  console.log('═'.repeat(80));
  console.log('DIAGNOSTIC REPORT');
  console.log('═'.repeat(80));
  
  // Summary
  const total = results.length;
  const passed = results.filter(r => r.success).length;
  const failed = total - passed;
  
  console.log(`\nSummary: ${passed}/${total} passed (${failed} failed)`);
  
  // By Category
  console.log('\n--- By Category ---');
  const categories = [...new Set(results.map(r => r.test.category))];
  for (const category of categories) {
    const categoryResults = results.filter(r => r.test.category === category);
    const categoryPassed = categoryResults.filter(r => r.success).length;
    console.log(`${category}: ${categoryPassed}/${categoryResults.length}`);
  }
  
  // Failed Tests
  console.log('\n--- Failed Tests ---');
  const failedTests = results.filter(r => !r.success);
  if (failedTests.length === 0) {
    console.log('None! All tests passed ✅');
  } else {
    for (const result of failedTests) {
      console.log(`\n❌ ${result.test.name} (${result.test.nameAr})`);
      console.log(`   Expected: ${result.test.expectedBlockType}`);
      console.log(`   Got: ${result.importerType || 'null'}`);
      console.log(`   Failure Point: ${result.failurePoint}`);
      console.log(`   Parser Type: ${result.parserType}`);
    }
  }
  
  // Detailed Table
  console.log('\n--- Detailed Table ---');
  console.log('| Component | Parser | Importer | Registry | Status |');
  console.log('|-----------|--------|----------|----------|--------|');
  for (const result of results) {
    const parser = result.parserType ? '✅' : '❌';
    const importer = result.importerType ? '✅' : '❌';
    const registry = result.registryExists ? '✅' : '❌';
    const status = result.success ? '✅' : '❌';
    console.log(`| ${result.test.name.padEnd(13)} | ${parser.padEnd(6)} | ${importer.padEnd(8)} | ${registry.padEnd(8)} | ${status.padEnd(6)} |`);
  }
  
  // Recommendations
  console.log('\n--- Recommendations ---');
  const parserIssues = results.filter(r => !r.parserType);
  const importerIssues = results.filter(r => r.parserType && !r.importerType);
  const typeMismatches = results.filter(r => r.importerType && r.importerType !== r.test.expectedBlockType);
  
  if (parserIssues.length > 0) {
    console.log(`\n🔴 Parser Issues (${parserIssues.length}):`);
    console.log('   Components not recognized by parser:');
    parserIssues.forEach(r => console.log(`   - ${r.test.name}`));
    console.log('   → Fix: Update @artoon/parser to recognize these syntaxes');
  }
  
  if (importerIssues.length > 0) {
    console.log(`\n🟡 Importer Issues (${importerIssues.length}):`);
    console.log('   Parser outputs not converted to blocks:');
    importerIssues.forEach(r => console.log(`   - ${r.test.name} (parser: ${r.parserType})`));
    console.log('   → Fix: Update ARTOONImporter to handle these node types');
  }
  
  if (typeMismatches.length > 0) {
    console.log(`\n🟠 Type Mismatches (${typeMismatches.length}):`);
    console.log('   Importer produces wrong block type:');
    typeMismatches.forEach(r => console.log(`   - ${r.test.name}: expected '${r.test.expectedBlockType}', got '${r.importerType}'`));
    console.log('   → Fix: Update ARTOONImporter conversion logic');
  }
  
  console.log('\n' + '═'.repeat(80));
}

// Run all tests
console.log('Starting Component Flow Diagnostic...\n');
const results = tests.map(testComponent);
generateReport(results);

// Export results to JSON
const fs = require('fs');
fs.writeFileSync(
  'diagnostic-results.json',
  JSON.stringify(results, null, 2)
);
console.log('\n✓ Results saved to diagnostic-results.json');
