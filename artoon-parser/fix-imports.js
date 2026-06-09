// Fix ES Module imports by adding .js extensions
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname, dirname } from 'path';

function fixImportsInFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;

  // Fix relative imports without .js extension
  const importRegex = /from\s+['"](\.\.[^'"]+)['"]/g;
  
  content = content.replace(importRegex, (match, importPath) => {
    // Skip if already has extension
    if (importPath.endsWith('.js') || importPath.endsWith('.ts')) {
      return match;
    }
    
    // Check if it's a directory import (needs /index.js)
    const resolvedPath = join(dirname(filePath), importPath);
    const tsPath = resolvedPath + '.ts';
    const indexPath = join(resolvedPath, 'index.ts');
    
    modified = true;
    
    if (existsSync(indexPath)) {
      // It's a directory, add /index.js
      return match.replace(importPath, importPath + '/index.js');
    } else {
      // It's a file, add .js
      return match.replace(importPath, importPath + '.js');
    }
  });

  if (modified) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Fixed: ${filePath}`);
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
      fixImportsInFile(fullPath);
    }
  }
}

console.log('Fixing imports in artoon-parser...');
processDirectory('./src');
console.log('Done!');
