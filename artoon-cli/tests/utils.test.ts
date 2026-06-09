import * as path from 'path';
import * as fs from 'fs';
import { readFile, writeFile, isArtoonFile, getOutputPath } from '../src/utils/file';
import { formatIssue, formatSummary, ValidationIssue } from '../src/utils/output';
import { ExitCodes } from '../src/utils/exit-codes';

describe('File Utils', () => {
  const testDir = path.join(__dirname, 'temp');
  const testFile = path.join(testDir, 'test.artoon');

  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  test('readFile - file not found', () => {
    const result = readFile('/nonexistent/file.artoon');
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  test('writeFile and readFile', () => {
    const content = '>.p:: Hello World';
    const writeResult = writeFile(testFile, content);
    expect(writeResult.success).toBe(true);

    const readResult = readFile(testFile);
    expect(readResult.success).toBe(true);
    expect(readResult.content).toBe(content);
  });

  test('isArtoonFile', () => {
    expect(isArtoonFile('test.artoon')).toBe(true);
    expect(isArtoonFile('test.toon')).toBe(true);
    expect(isArtoonFile('test.txt')).toBe(false);
    expect(isArtoonFile('test.html')).toBe(false);
  });

  test('getOutputPath', () => {
    expect(getOutputPath('test.artoon', 'html')).toBe('test.html');
    expect(getOutputPath('dir/test.artoon', 'json')).toBe(path.join('dir', 'test.json'));
  });
});

describe('Output Utils', () => {
  test('formatIssue - error', () => {
    const issue: ValidationIssue = {
      code: 'SYN001',
      message: 'Missing space after separator',
      line: 5,
      severity: 'error',
    };
    const formatted = formatIssue(issue);
    expect(formatted).toContain('error');
    expect(formatted).toContain('line 5');
    expect(formatted).toContain('SYN001');
  });

  test('formatIssue - warning', () => {
    const issue: ValidationIssue = {
      code: 'PHI001',
      message: 'Presentation leak detected',
      line: 10,
      severity: 'warning',
    };
    const formatted = formatIssue(issue);
    expect(formatted).toContain('warn');
    expect(formatted).toContain('line 10');
  });

  test('formatSummary - no issues', () => {
    const summary = formatSummary(0, 0);
    expect(summary).toContain('No issues');
  });

  test('formatSummary - with issues', () => {
    const summary = formatSummary(2, 3);
    expect(summary).toContain('2 error');
    expect(summary).toContain('3 warning');
  });
});

describe('Exit Codes', () => {
  test('exit codes defined', () => {
    expect(ExitCodes.SUCCESS).toBe(0);
    expect(ExitCodes.SYNTAX_ERROR).toBe(1);
    expect(ExitCodes.VALIDATION_ERROR).toBe(2);
    expect(ExitCodes.PHILOSOPHY_BREACH).toBe(3);
    expect(ExitCodes.FILE_NOT_FOUND).toBe(4);
  });
});
