import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';

describe('CLI Migrate Command', () => {
  const testDir = path.join(__dirname, 'temp-migrate');
  const cliPath = path.join(__dirname, '..', 'dist', 'index.js');
  const cliBuilt = fs.existsSync(cliPath);

  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  beforeEach(() => {
    // Clean test dir before each test
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterAll(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  test('migrate .artoon file (v1 to v2 syntax)', () => {
    if (!cliBuilt) return;

    const v1File = path.join(testDir, 'v1.artoon');
    fs.writeFileSync(v1File, '>.p:: Hello World\n>.t1:: Title', 'utf-8');

    const output = execSync(`node "${cliPath}" migrate "${v1File}"`, {
      encoding: 'utf-8',
    });

    expect(output).toContain('Migration complete');
    expect(output).toContain('Files processed: 1');
    expect(output).toContain('Files migrated: 1');

    // Verify file was updated
    const migrated = fs.readFileSync(v1File, 'utf-8');
    expect(migrated).toContain('::');
  });

  test('migrate directory', () => {
    if (!cliBuilt) return;

    const file1 = path.join(testDir, 'a.artoon');
    const file2 = path.join(testDir, 'b.artoon');
    fs.writeFileSync(file1, '>.p:: Test A', 'utf-8');
    fs.writeFileSync(file2, '>.p:: Test B', 'utf-8');

    const output = execSync(`node "${cliPath}" migrate "${testDir}"`, {
      encoding: 'utf-8',
    });

    expect(output).toContain('Files processed: 2');
    expect(output).toContain('Files migrated: 2');
  });

  test('migrate --dry-run does not modify files', () => {
    if (!cliBuilt) return;

    const file = path.join(testDir, 'dry.artoon');
    const original = '>.p:: Original';
    fs.writeFileSync(file, original, 'utf-8');

    const output = execSync(`node "${cliPath}" migrate "${file}" --dry-run`, {
      encoding: 'utf-8',
    });

    expect(output).toContain('[DRY RUN]');

    const after = fs.readFileSync(file, 'utf-8');
    expect(after).toBe(original);
  });

  test('migrate skips non-.artoon files', () => {
    if (!cliBuilt) return;

    const txtFile = path.join(testDir, 'readme.txt');
    fs.writeFileSync(txtFile, 'Hello', 'utf-8');

    const output = execSync(`node "${cliPath}" migrate "${testDir}"`, {
      encoding: 'utf-8',
    });

    expect(output).toContain('Migration complete');
    expect(output).toContain('Files processed: 0');
  });

  test('migrate v2 JSON file is skipped', () => {
    if (!cliBuilt) return;

    const jsonFile = path.join(testDir, 'v2.json');
    const v2Doc = { version: '2.0', content: [] };
    fs.writeFileSync(jsonFile, JSON.stringify(v2Doc, null, 2), 'utf-8');

    const output = execSync(`node "${cliPath}" migrate "${jsonFile}"`, {
      encoding: 'utf-8',
    });

    expect(output).toContain('Already V2.0');
  });

  test('migrate v1 JSON file is upgraded', () => {
    if (!cliBuilt) return;

    const jsonFile = path.join(testDir, 'v1.json');
    const v1Doc = { version: '1.0', content: [{ type: 'text', textType: 'p', content: [] }] };
    fs.writeFileSync(jsonFile, JSON.stringify(v1Doc, null, 2), 'utf-8');

    const output = execSync(`node "${cliPath}" migrate "${jsonFile}"`, {
      encoding: 'utf-8',
    });

    expect(output).toContain('Migrated:');

    const migrated = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
    expect(migrated.version).toBe('2.0');
  });
});
