/**
 * Block Diagnostics Tool
 * 
 * Systematically checks all block types to identify issues in:
 * - Editor rendering
 * - Preview rendering
 * - Export/Import pipeline
 */

import { defaultBlockDefinitions } from '../src/blocks/definitions';
import * as fs from 'fs';
import * as path from 'path';

interface BlockDiagnostic {
  type: string;
  name: string;
  nameAr: string;
  category: string;
  checks: {
    definitionExists: boolean;
    viewFileExists: boolean;
    rendererSupports: boolean;
    exporterSupports: boolean;
    importerSupports: boolean;
  };
  status: 'ok' | 'partial' | 'broken';
  issues: string[];
  fixes: string[];
}

function toTitleCase(str: string): string {
  return str
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

function diagnoseBlock(blockType: string): BlockDiagnostic {
  const issues: string[] = [];
  const fixes: string[] = [];
  
  // 1. Check definition
  const def = defaultBlockDefinitions.find(d => d.type === blockType);
  const definitionExists = !!def;
  if (!definitionExists) {
    issues.push('Definition not found in definitions.ts');
    fixes.push('Add definition to defaultBlockDefinitions array');
  }
  
  // 2. Check view file
  const viewFileName = toTitleCase(blockType) + 'BlockView.ts';
  const viewPath = path.join(__dirname, '../src/blocks/views', viewFileName);
  const viewFileExists = fs.existsSync(viewPath);
  if (!viewFileExists) {
    issues.push(`View file not found: ${viewFileName}`);
    fixes.push(`Create src/blocks/views/${viewFileName}`);
  }
  
  // 3. Check BlockRenderer
  const rendererPath = path.join(__dirname, '../src/ui/components/BlockRenderer.tsx');
  const rendererContent = fs.readFileSync(rendererPath, 'utf-8');
  const rendererSupports = rendererContent.includes(`case '${blockType}':`);
  if (!rendererSupports) {
    issues.push(`BlockRenderer doesn't have case for '${blockType}'`);
    fixes.push(`Add case '${blockType}': return <${toTitleCase(blockType)}BlockView ... /> in BlockRenderer.tsx`);
  }
  
  // 4. Check ARTOONExporter
  const exporterPath = path.join(__dirname, '../src/integration/ARTOONExporter.ts');
  const exporterContent = fs.readFileSync(exporterPath, 'utf-8');
  const exporterSupports = exporterContent.includes(`case '${blockType}':`);
  if (!exporterSupports) {
    issues.push(`ARTOONExporter doesn't have case for '${blockType}'`);
    fixes.push(`Add case '${blockType}': return this.convert${toTitleCase(blockType)}(...) in ARTOONExporter.ts`);
  }
  
  // 5. Check ARTOONImporter
  const importerPath = path.join(__dirname, '../src/integration/ARTOONImporter.ts');
  const importerContent = fs.readFileSync(importerPath, 'utf-8');
  const importerSupports = importerContent.includes(blockType) || importerContent.includes(toTitleCase(blockType));
  if (!importerSupports) {
    issues.push(`ARTOONImporter might not support '${blockType}'`);
    fixes.push(`Verify ARTOONImporter can convert AST nodes to ${blockType}`);
  }
  
  // 6. Determine status
  let status: 'ok' | 'partial' | 'broken' = 'ok';
  if (issues.length > 0) {
    status = issues.length >= 3 ? 'broken' : 'partial';
  }
  
  return {
    type: blockType,
    name: def?.name || 'Unknown',
    nameAr: def?.nameAr || 'غير معروف',
    category: def?.category || 'unknown',
    checks: {
      definitionExists,
      viewFileExists,
      rendererSupports,
      exporterSupports,
      importerSupports,
    },
    status,
    issues,
    fixes,
  };
}

function generateMarkdownReport(results: BlockDiagnostic[]): string {
  let md = '# تقرير تشخيص البلوكات - ARTOON Editor\n\n';
  md += `**التاريخ**: ${new Date().toISOString().split('T')[0]}\n\n`;
  md += '---\n\n';
  
  // Summary
  const ok = results.filter(r => r.status === 'ok').length;
  const partial = results.filter(r => r.status === 'partial').length;
  const broken = results.filter(r => r.status === 'broken').length;
  
  md += '## 📊 الملخص\n\n';
  md += `- ✅ **سليم**: ${ok}/${results.length}\n`;
  md += `- ⚠️  **جزئي**: ${partial}/${results.length}\n`;
  md += `- ❌ **معطل**: ${broken}/${results.length}\n\n`;
  
  // By category
  md += '## 📋 حسب الفئة\n\n';
  const categories = [...new Set(results.map(r => r.category))];
  for (const cat of categories) {
    const catResults = results.filter(r => r.category === cat);
    const catOk = catResults.filter(r => r.status === 'ok').length;
    md += `- **${cat}**: ${catOk}/${catResults.length} سليم\n`;
  }
  md += '\n';
  
  // Broken blocks
  const brokenBlocks = results.filter(r => r.status === 'broken');
  if (brokenBlocks.length > 0) {
    md += '## ❌ البلوكات المعطلة\n\n';
    for (const block of brokenBlocks) {
      md += `### ${block.type} (${block.nameAr})\n\n`;
      md += '**المشاكل**:\n';
      for (const issue of block.issues) {
        md += `- ❌ ${issue}\n`;
      }
      md += '\n**الحلول المقترحة**:\n';
      for (const fix of block.fixes) {
        md += `- 🔧 ${fix}\n`;
      }
      md += '\n';
    }
  }
  
  // Partial blocks
  const partialBlocks = results.filter(r => r.status === 'partial');
  if (partialBlocks.length > 0) {
    md += '## ⚠️  البلوكات الجزئية\n\n';
    for (const block of partialBlocks) {
      md += `### ${block.type} (${block.nameAr})\n\n`;
      md += '**المشاكل**:\n';
      for (const issue of block.issues) {
        md += `- ⚠️  ${issue}\n`;
      }
      md += '\n**الحلول المقترحة**:\n';
      for (const fix of block.fixes) {
        md += `- 🔧 ${fix}\n`;
      }
      md += '\n';
    }
  }
  
  // Detailed table
  md += '## 📊 جدول تفصيلي\n\n';
  md += '| النوع | الاسم | Definition | View | Renderer | Exporter | Importer | الحالة |\n';
  md += '|-------|-------|------------|------|----------|----------|----------|--------|\n';
  
  for (const result of results) {
    const statusIcon = result.status === 'ok' ? '✅' : result.status === 'partial' ? '⚠️' : '❌';
    md += `| ${result.type} | ${result.nameAr} | `;
    md += `${result.checks.definitionExists ? '✅' : '❌'} | `;
    md += `${result.checks.viewFileExists ? '✅' : '❌'} | `;
    md += `${result.checks.rendererSupports ? '✅' : '❌'} | `;
    md += `${result.checks.exporterSupports ? '✅' : '❌'} | `;
    md += `${result.checks.importerSupports ? '✅' : '❌'} | `;
    md += `${statusIcon} |\n`;
  }
  
  return md;
}

function main() {
  console.log('🔍 ARTOON Block Diagnostics\n');
  console.log('═'.repeat(80));
  
  const results: BlockDiagnostic[] = [];
  
  for (const def of defaultBlockDefinitions) {
    const result = diagnoseBlock(def.type);
    results.push(result);
  }
  
  // Console summary
  const ok = results.filter(r => r.status === 'ok').length;
  const partial = results.filter(r => r.status === 'partial').length;
  const broken = results.filter(r => r.status === 'broken').length;
  
  console.log(`\n📊 الملخص:`);
  console.log(`✅ سليم: ${ok}/${results.length}`);
  console.log(`⚠️  جزئي: ${partial}/${results.length}`);
  console.log(`❌ معطل: ${broken}/${results.length}`);
  
  // Console details
  if (broken > 0 || partial > 0) {
    console.log(`\n📋 التفاصيل:\n`);
    
    for (const result of results) {
      if (result.status !== 'ok') {
        const icon = result.status === 'broken' ? '❌' : '⚠️';
        console.log(`${icon} ${result.type} (${result.nameAr})`);
        for (const issue of result.issues) {
          console.log(`   • ${issue}`);
        }
        console.log('');
      }
    }
  }
  
  // Generate markdown report
  const markdown = generateMarkdownReport(results);
  const reportPath = path.join(__dirname, '../../DIAGNOSTIC-REPORT.md');
  fs.writeFileSync(reportPath, markdown);
  console.log(`✅ تم حفظ التقرير في: DIAGNOSTIC-REPORT.md\n`);
}

main();
