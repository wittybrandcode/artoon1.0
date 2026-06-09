/**
 * Systematic Syntax Error Diagnosis Tool
 * Parses ARTOON file and reports all syntax errors with line numbers
 */

const fs = require('fs');
const path = require('path');

// Import parser
const parserPath = path.join(__dirname, '../artoon-parser/dist/index.js');
const { parse } = require(parserPath);

// File to diagnose
const exampleFile = path.join(__dirname, '../artoon-examples/complete-syntax-showcase.artoon');

console.log('═══════════════════════════════════════════════════════════════');
console.log('  ARTOON SYNTAX ERROR DIAGNOSIS');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log(`📄 File: ${path.basename(exampleFile)}\n`);

// Read file
const content = fs.readFileSync(exampleFile, 'utf-8');
const lines = content.split('\n');

console.log(`📊 Total lines: ${lines.length}\n`);

// Parse and catch errors
console.log('🔍 Parsing file...\n');

try {
  const ast = parse(content);
  
  console.log('✅ PARSING SUCCESSFUL!\n');
  console.log(`📦 Document structure:`);
  console.log(`   - Meta block: ${ast.meta ? 'Yes' : 'No'}`);
  console.log(`   - Content blocks: ${ast.content.length}`);
  
  // Analyze content
  const blockTypes = {};
  ast.content.forEach(node => {
    const type = node.type;
    blockTypes[type] = (blockTypes[type] || 0) + 1;
  });
  
  console.log(`\n📋 Block type distribution:`);
  Object.entries(blockTypes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`);
    });
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  NO SYNTAX ERRORS FOUND');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
} catch (error) {
  console.log('❌ PARSING FAILED!\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  ERROR DETAILS');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log(`Error Type: ${error.name}`);
  console.log(`Message: ${error.message}\n`);
  
  if (error.line) {
    console.log(`Line Number: ${error.line}`);
    console.log(`Column: ${error.column || 'N/A'}\n`);
    
    // Show context
    const lineNum = error.line - 1;
    const start = Math.max(0, lineNum - 2);
    const end = Math.min(lines.length, lineNum + 3);
    
    console.log('Context:');
    console.log('─────────────────────────────────────────────────────────────\n');
    
    for (let i = start; i < end; i++) {
      const marker = i === lineNum ? '→' : ' ';
      const lineNumber = String(i + 1).padStart(4, ' ');
      console.log(`${marker} ${lineNumber} | ${lines[i]}`);
    }
    console.log('\n─────────────────────────────────────────────────────────────\n');
  }
  
  if (error.stack) {
    console.log('Stack Trace:');
    console.log(error.stack);
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  DIAGNOSIS COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  process.exit(1);
}
