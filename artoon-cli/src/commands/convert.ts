import { parse } from '@artoon/parser';
import { transform } from '@artoon/ast';
import { serialize } from '@artoon/serializer';
import { render } from '@artoon/renderer-html';
import { readFile, writeFile, getOutputPath } from '../utils/file.js';
import { printSuccess, printError } from '../utils/output.js';
import { ExitCodes } from '../utils/exit-codes.js';

interface ConvertOptions {
  output?: string;
}

/**
 * Convert command - Convert ARTOON to other formats
 * Usage: artoon convert <format> <file>
 *   format: html | md | artoon
 */
export function convertCommand(format: string, file: string, options: ConvertOptions): void {
  // Validate format
  const validFormats = ['html', 'md', 'arto', 'artoon'];
  const targetFormat = format === 'md' ? 'md' : format === 'html' ? 'html' : 'arto';

  if (!validFormats.includes(format)) {
    printError(`Unknown format: ${format}. Supported: html, md, artoon`);
    process.exit(ExitCodes.SYNTAX_ERROR);
  }

  // Read file
  const fileResult = readFile(file);
  if (!fileResult.success) {
    printError(fileResult.error!);
    process.exit(ExitCodes.FILE_NOT_FOUND);
  }

  const content = fileResult.content!;

  // Determine output path
  const extensionMap: Record<string, string> = {
    html: 'html',
    md: 'md',
    arto: 'artoon',
  };
  const outputPath = options.output || getOutputPath(file, extensionMap[targetFormat]);

  let output: string;

  if (targetFormat === 'arto') {
    // Convert Markdown/HTML to ARTOON (basic)
    output = convertToArtoon(content);
  } else {
    // Convert ARTOON to target format
    // Parse ARTOON file
    const parseResult = parse(content);
    if (parseResult.errors && parseResult.errors.length > 0) {
      for (const error of parseResult.errors) {
        printError(`line ${error.line}: ${error.message}`);
      }
      process.exit(ExitCodes.SYNTAX_ERROR);
    }

    const ast = transform(parseResult);

    if (targetFormat === 'html') {
      output = render(ast);
    } else if (targetFormat === 'md') {
      output = renderToMarkdown(ast);
    } else {
      output = '';
    }
  }

  // Write output
  const writeResult = writeFile(outputPath, output);
  if (!writeResult.success) {
    printError(writeResult.error!);
    process.exit(ExitCodes.IO_ERROR);
  }

  printSuccess(`Converted to ${targetFormat.toUpperCase()}: ${outputPath}`);
  process.exit(ExitCodes.SUCCESS);
}

/**
 * Render ARTOON AST to Markdown
 */
function renderToMarkdown(doc: any): string {
  const lines: string[] = [];

  // Handle meta
  if (doc.meta && typeof doc.meta === 'object') {
    if ('title' in doc.meta && doc.meta.title) {
      lines.push(`# ${doc.meta.title}`);
      lines.push('');
    }
  }

  // Render content
  if (doc.content && Array.isArray(doc.content)) {
    for (const node of doc.content) {
      const md = renderNodeToMarkdown(node);
      if (md) {
        lines.push(md);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Render a single node to Markdown
 */
function renderNodeToMarkdown(node: any): string {
  if (!node) return '';

  switch (node.nodeType || node.type) {
    case 'text': {
      const text = extractText(node.content);
      const dir = node.direction === 'rtl' ? '' : '';
      switch (node.textType) {
        case 't1': return `# ${text}`;
        case 't2': return `## ${text}`;
        case 't3': return `### ${text}`;
        case 't4': return `#### ${text}`;
        case 't5': return `##### ${text}`;
        case 't6': return `###### ${text}`;
        case 'q': return `> ${text}`;
        case 'pre': return `\`\`\`\n${text}\n\`\`\``;
        default: return text;
      }
    }

    case 'list': {
      const items: string[] = [];
      if (node.items && Array.isArray(node.items)) {
        for (let i = 0; i < node.items.length; i++) {
          const item = node.items[i];
          const text = extractText(item.content);
          const marker = node.listType === 'ordered' ? `${i + 1}.` : '-';
          items.push(`${marker} ${text}`);
        }
      }
      return items.join('\n');
    }

    case 'code': {
      const lang = node.language || '';
      const code = node.code || '';
      return `\`\`\`${lang}\n${code}\n\`\`\``;
    }

    case 'divider':
    case 'separator':
      return '---';

    case 'image': {
      const alt = node.alt || '';
      const src = node.src || '';
      return `![${alt}](${src})`;
    }

    case 'link': {
      const label = extractText(node.content) || node.href || '';
      const href = node.href || '';
      return `[${label}](${href})`;
    }

    case 'table': {
      if (!node.rows || node.rows.length === 0) return '';
      const rows: string[] = [];
      for (const row of node.rows) {
        if (row.cells && Array.isArray(row.cells)) {
          const cells = row.cells.map((c: any) => extractText(c.content));
          rows.push(`| ${cells.join(' | ')} |`);
        }
      }
      // Add header separator if there are rows
      if (rows.length > 0) {
        const colCount = node.rows[0].cells?.length || 1;
        rows.splice(1, 0, `| ${Array(colCount).fill('---').join(' | ')} |`);
      }
      return rows.join('\n');
    }

    case 'figure': {
      const caption = node.caption ? extractText(node.caption) : '';
      const media = node.media || {};
      const src = media.src || '';
      const alt = media.alt || '';
      return `![${alt}](${src})\n*${caption}*`;
    }

    case 'details': {
      const summary = node.summary ? extractText(node.summary) : 'Details';
      const body = node.content ? renderNodeToMarkdown(node.content) : '';
      return `<details>\n<summary>${summary}</summary>\n\n${body}\n</details>`;
    }

    case 'comment':
      return `<!-- ${node.text || ''} -->`;

    default:
      return '';
  }
}

/**
 * Extract plain text from inline content
 */
function extractText(content: any[]): string {
  if (!content || !Array.isArray(content)) return '';

  return content.map(item => {
    if (typeof item === 'string') return item;
    if (item.type === 'text') return item.text || '';
    if (item.type === 'inline-component') {
      // For inline components, extract value
      const val = item.value || '';
      const mods = item.mods || [];
      // Handle modifiers
      let text = val;
      if (mods.includes('s')) text = `**${text}**`;
      if (mods.includes('i')) text = `*${text}*`;
      if (mods.includes('c')) text = `\`${text}\``;
      if (mods.includes('d')) text = `~~${text}~~`;
      if (mods.includes('u')) text = `<u>${text}</u>`;
      if (mods.includes('sub')) text = `<sub>${text}</sub>`;
      if (mods.includes('sup')) text = `<sup>${text}</sup>`;
      return text;
    }
    return '';
  }).join('');
}

/**
 * Convert Markdown/HTML to ARTOON (basic implementation)
 */
function convertToArtoon(content: string): string {
  const lines: string[] = [];
  const mdLines = content.split(/\r?\n/);
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = 'plaintext';
  let inTable = false;
  let tableRows: string[][] = [];

  for (let i = 0; i < mdLines.length; i++) {
    const line = mdLines[i].trim();

    // Code block
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        lines.push(`<code:${codeLang}>`);
        lines.push(...codeBuffer);
        lines.push('<code>');
        inCodeBlock = false;
        codeBuffer = [];
      } else {
        // Start code block
        inCodeBlock = true;
        codeLang = line.slice(3).trim() || 'plaintext';
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(mdLines[i]); // Preserve original indentation in code
      continue;
    }

    // Table
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line.slice(1, -1).split('|').map(c => c.trim());
      // Skip separator row
      if (!cells.every(c => /^-+$/.test(c.replace(/\s/g, '')))) {
        tableRows.push(cells);
      }
      inTable = true;
      continue;
    } else if (inTable && tableRows.length > 0) {
      // Output table
      const header = tableRows[0];
      const body = tableRows.slice(1);
      const headerLine = header.map(h => `[th:: ${h}]`).join(' ');
      lines.push(`>.[table]:: ${headerLine}`);
      for (const row of body) {
        const rowLine = row.map(c => `[td:: ${c}]`).join(' ');
        lines.push(`>.[tr]:: ${rowLine}`);
      }
      tableRows = [];
      inTable = false;
    }

    // Empty line
    if (line === '') {
      continue;
    }

    // Horizontal rule
    if (line === '---' || line === '***' || line === '___') {
      lines.push('>.[hr]::');
      continue;
    }

    // Headings
    if (line.startsWith('###### ')) {
      lines.push(`>.[t6]:: ${convertInlineMdToArtoon(line.slice(7))}`);
      continue;
    }
    if (line.startsWith('##### ')) {
      lines.push(`>.[t5]:: ${convertInlineMdToArtoon(line.slice(6))}`);
      continue;
    }
    if (line.startsWith('#### ')) {
      lines.push(`>.[t4]:: ${convertInlineMdToArtoon(line.slice(5))}`);
      continue;
    }
    if (line.startsWith('### ')) {
      lines.push(`>.[t3]:: ${convertInlineMdToArtoon(line.slice(4))}`);
      continue;
    }
    if (line.startsWith('## ')) {
      lines.push(`>.[t2]:: ${convertInlineMdToArtoon(line.slice(3))}`);
      continue;
    }
    if (line.startsWith('# ')) {
      lines.push(`>.[t1]:: ${convertInlineMdToArtoon(line.slice(2))}`);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      lines.push(`>.[q]:: ${convertInlineMdToArtoon(line.slice(2))}`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const text = line.replace(/^\d+\.\s/, '');
      lines.push(`>.[ol]::`);
      lines.push(`- ${convertInlineMdToArtoon(text)}`);
      // Collect subsequent list items
      while (i + 1 < mdLines.length && /^\d+\.\s/.test(mdLines[i + 1].trim())) {
        i++;
        const nextText = mdLines[i].trim().replace(/^\d+\.\s/, '');
        lines.push(`- ${convertInlineMdToArtoon(nextText)}`);
      }
      continue;
    }

    // Unordered list
    if (/^[-*+]\s/.test(line)) {
      const text = line.slice(2);
      lines.push(`>.[ul]::`);
      lines.push(`- ${convertInlineMdToArtoon(text)}`);
      // Collect subsequent list items
      while (i + 1 < mdLines.length && /^[-*+]\s/.test(mdLines[i + 1].trim())) {
        i++;
        lines.push(`- ${convertInlineMdToArtoon(mdLines[i].trim().slice(2))}`);
      }
      continue;
    }

    // Image
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      lines.push(`>.[img:: ${imageMatch[2]}][alt:: ${imageMatch[1]}]`);
      continue;
    }

    // Link (standalone)
    const linkMatch = line.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      lines.push(`>.[link:: ${linkMatch[2]}]:: ${linkMatch[1]}`);
      continue;
    }

    // Default: paragraph
    lines.push(`>.[p]:: ${convertInlineMdToArtoon(line)}`);
  }

  // Flush any remaining table
  if (inTable && tableRows.length > 0) {
    const header = tableRows[0];
    const body = tableRows.slice(1);
    const headerLine = header.map(h => `[th:: ${h}]`).join(' ');
    lines.push(`>.[table]:: ${headerLine}`);
    for (const row of body) {
      const rowLine = row.map(c => `[td:: ${c}]`).join(' ');
      lines.push(`>.[tr]:: ${rowLine}`);
    }
  }

  // Flush any remaining code block
  if (inCodeBlock) {
    lines.push(`<code:${codeLang}>`);
    lines.push(...codeBuffer);
    lines.push('<code>');
  }

  return lines.join('\n');
}

/**
 * Convert inline Markdown syntax to ARTOON inline components
 */
function convertInlineMdToArtoon(text: string): string {
  let result = text;

  // Code inline
  result = result.replace(/`([^`]+)`/g, '[c:: $1]');

  // Bold + italic
  result = result.replace(/\*\*\*([^*]+)\*\*\*/g, '[s+i:: $1]');

  // Bold
  result = result.replace(/\*\*([^*]+)\*\*/g, '[s:: $1]');
  result = result.replace(/__([^_]+)__/g, '[s:: $1]');

  // Italic
  result = result.replace(/\*([^*]+)\*/g, '[i:: $1]');
  result = result.replace(/_([^_]+)_/g, '[i:: $1]');

  // Strikethrough
  result = result.replace(/~~([^~]+)~~/g, '[d:: $1]');

  // Link
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[link:: $2]:: $1');

  return result;
}
