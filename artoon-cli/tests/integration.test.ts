import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';

describe('CLI Integration', () => {
  const testDir = path.join(__dirname, 'temp-integration');
  const sampleFile = path.join(testDir, 'sample.artoon');
  const invalidFile = path.join(testDir, 'invalid.artoon');
  const cliPath = path.join(__dirname, '..', 'dist', 'index.js');

  // Check if CLI is built
  const cliBuilt = fs.existsSync(cliPath);

  beforeAll(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Create valid sample file
    fs.writeFileSync(sampleFile, `>.p:: مرحباً بالعالم
>.t1:: عنوان رئيسي
<.p:: Hello World`, 'utf-8');

    // Create invalid sample file
    fs.writeFileSync(invalidFile, `>.p::missing space
<code>.
unclosed block`, 'utf-8');
  });

  afterAll(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  describe('Parse Command', () => {
    test('parse valid file', () => {
      if (!cliBuilt) return;
      
      const output = execSync(`node "${cliPath}" parse "${sampleFile}"`, {
        encoding: 'utf-8',
      });
      const ast = JSON.parse(output);
      expect(ast).toBeDefined();
      expect(ast.type).toBe('document');
    });

    test('parse with --compact', () => {
      if (!cliBuilt) return;
      
      const output = execSync(`node "${cliPath}" parse "${sampleFile}" --compact`, {
        encoding: 'utf-8',
      });
      // Compact JSON should be single line (no pretty printing)
      const parsed = JSON.parse(output);
      expect(parsed.type).toBe('document');
    });

    test('parse with --transformed', () => {
      if (!cliBuilt) return;
      
      const output = execSync(`node "${cliPath}" parse "${sampleFile}" --transformed`, {
        encoding: 'utf-8',
      });
      const ast = JSON.parse(output);
      expect(ast.version).toBeDefined();
      expect(ast.content).toBeDefined();
    });

    test('parse with --state', () => {
      if (!cliBuilt) return;

      const output = execSync(`node "${cliPath}" parse "${sampleFile}" --state`, {
        encoding: 'utf-8',
      });
      const stateJson = JSON.parse(output);
      expect(stateJson.doc).toBeDefined();
      expect(stateJson.selection).toBeDefined();
      expect(stateJson.doc.version).toBeDefined();
    });

    test('parse with output file', () => {
      if (!cliBuilt) return;
      
      const outputFile = path.join(testDir, 'output.json');
      execSync(`node "${cliPath}" parse "${sampleFile}" -o "${outputFile}"`, {
        encoding: 'utf-8',
      });
      expect(fs.existsSync(outputFile)).toBe(true);
      const content = fs.readFileSync(outputFile, 'utf-8');
      const ast = JSON.parse(content);
      expect(ast.type).toBe('document');
    });
  });

  describe('Render Command', () => {
    test('render valid file', () => {
      if (!cliBuilt) return;
      
      const output = execSync(`node "${cliPath}" render "${sampleFile}"`, {
        encoding: 'utf-8',
      });
      expect(output).toContain('<p');
    });

    test('render with --full', () => {
      if (!cliBuilt) return;
      
      const output = execSync(`node "${cliPath}" render "${sampleFile}" --full`, {
        encoding: 'utf-8',
      });
      expect(output).toContain('<!DOCTYPE html>');
      expect(output).toContain('<html');
      expect(output).toContain('</html>');
    });

    test('render with output file', () => {
      if (!cliBuilt) return;
      
      const outputFile = path.join(testDir, 'output.html');
      execSync(`node "${cliPath}" render "${sampleFile}" -o "${outputFile}"`, {
        encoding: 'utf-8',
      });
      expect(fs.existsSync(outputFile)).toBe(true);
      const content = fs.readFileSync(outputFile, 'utf-8');
      expect(content).toContain('<p');
    });
  });

  describe('Validate Command', () => {
    test('validate valid file', () => {
      if (!cliBuilt) return;
      
      const output = execSync(`node "${cliPath}" validate "${sampleFile}"`, {
        encoding: 'utf-8',
      });
      expect(output).toContain('valid');
    });

    test('validate with --json', () => {
      if (!cliBuilt) return;
      
      const output = execSync(`node "${cliPath}" validate "${sampleFile}" --json`, {
        encoding: 'utf-8',
      });
      const result = JSON.parse(output);
      expect(result.valid).toBe(true);
      expect(result.errors).toBe(0);
    });

    test('validate invalid file exits with error', () => {
      if (!cliBuilt) return;
      
      try {
        execSync(`node "${cliPath}" validate "${invalidFile}"`, {
          encoding: 'utf-8',
        });
        fail('Should have thrown');
      } catch (err: any) {
        expect(err.status).toBeGreaterThan(0);
      }
    });
  });

  describe('Convert Command', () => {
    test('convert to html', () => {
      if (!cliBuilt) return;

      const outputFile = path.join(testDir, 'output.html');
      execSync(`node "${cliPath}" convert html "${sampleFile}" -o "${outputFile}"`, {
        encoding: 'utf-8',
      });
      expect(fs.existsSync(outputFile)).toBe(true);
      const content = fs.readFileSync(outputFile, 'utf-8');
      expect(content).toContain('<p');
    });

    test('convert to md', () => {
      if (!cliBuilt) return;

      const outputFile = path.join(testDir, 'output.md');
      execSync(`node "${cliPath}" convert md "${sampleFile}" -o "${outputFile}"`, {
        encoding: 'utf-8',
      });
      expect(fs.existsSync(outputFile)).toBe(true);
      const content = fs.readFileSync(outputFile, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
    });

    test('convert unknown format exits with error', () => {
      if (!cliBuilt) return;

      let threw = false;
      try {
        execSync(`node "${cliPath}" convert xyz "${sampleFile}"`, {
          encoding: 'utf-8',
        });
      } catch (err: any) {
        threw = true;
      }
      expect(threw).toBe(true);
    });
  });

  describe('Format Command', () => {
    test('format outputs to stdout', () => {
      if (!cliBuilt) return;

      const output = execSync(`node "${cliPath}" format "${sampleFile}"`, {
        encoding: 'utf-8',
      });
      expect(output.length).toBeGreaterThan(0);
      expect(output).toContain('::');
    });

    test('format --write overwrites file', () => {
      if (!cliBuilt) return;

      const testFile = path.join(testDir, 'format-test.artoon');
      fs.writeFileSync(testFile, '>.p:: Hello\n\n\n>.t1:: World', 'utf-8');

      execSync(`node "${cliPath}" format "${testFile}" --write`, {
        encoding: 'utf-8',
      });

      const content = fs.readFileSync(testFile, 'utf-8');
      expect(content).toContain('::');
    });
  });

  describe('Help and Version', () => {
    test('--help shows usage', () => {
      if (!cliBuilt) return;
      
      const output = execSync(`node "${cliPath}" --help`, {
        encoding: 'utf-8',
      });
      expect(output).toContain('artoon');
      expect(output).toContain('parse');
      expect(output).toContain('render');
      expect(output).toContain('validate');
      expect(output).toContain('convert');
      expect(output).toContain('format');
    });

    test('parse --help shows state option', () => {
      if (!cliBuilt) return;

      const output = execSync(`node "${cliPath}" parse --help`, {
        encoding: 'utf-8',
      });
      expect(output).toContain('--state');
    });

    test('--version shows version', () => {
      if (!cliBuilt) return;
      
      const output = execSync(`node "${cliPath}" --version`, {
        encoding: 'utf-8',
      });
      expect(output.trim()).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });
});
