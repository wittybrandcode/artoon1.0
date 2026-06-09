// Revert ES Module imports by removing .js extensions
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

function revertImportsInFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;

  // Remove .js from relative imports
  const importRegex = /from\s+['"](\.\.[^'"]+)\.js['"]/g;
  
  content = content.replace(importRegex, (match, importPath) => {
    modified = true;
    return `from '${importPath}'`;
  });

  if (modified) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Reverted: ${filePath}`);
  }
}

function processDirectory(dirPath) {
  const entries = readdirSync(dirPath);
  
  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (extname(fullPath) === '.ts') {
      revertImportsInFile(fullPath);
    }
  }
}

console.log('Reverting imports in artoon-parser...');
processDirectory('./src');
console.log('Done!');
