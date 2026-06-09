import * as fs from 'fs';
import * as path from 'path';

export interface FileResult {
  success: boolean;
  content?: string;
  error?: string;
}

export function readFile(filePath: string): FileResult {
  try {
    const absolutePath = path.resolve(filePath);
    
    if (!fs.existsSync(absolutePath)) {
      return { success: false, error: `File not found: ${filePath}` };
    }
    
    const content = fs.readFileSync(absolutePath, 'utf-8');
    return { success: true, content };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: `Failed to read file: ${message}` };
  }
}

export function writeFile(filePath: string, content: string): FileResult {
  try {
    const absolutePath = path.resolve(filePath);
    const dir = path.dirname(absolutePath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(absolutePath, content, 'utf-8');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: `Failed to write file: ${message}` };
  }
}

export function isArtoonFile(filePath: string): boolean {
  return filePath.endsWith('.artoon') || filePath.endsWith('.toon');
}

export function getOutputPath(inputPath: string, extension: string): string {
  const parsed = path.parse(inputPath);
  return path.join(parsed.dir, `${parsed.name}.${extension}`);
}
