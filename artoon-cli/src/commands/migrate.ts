import fs from 'fs';
import path from 'path';
import { migrateToV2, transform } from '@artoon/ast';
import { parse } from '@artoon/parser';
import { serialize } from '@artoon/serializer';

export async function migrateCommand(targetPath: string, options: { dryRun?: boolean }) {
    if (!fs.existsSync(targetPath)) {
        console.error(`Error: Path does not exist: ${targetPath}`);
        process.exit(1);
    }

    const stat = fs.statSync(targetPath);
    let processedCount = 0;
    let migratedCount = 0;

    const processFile = (filePath: string) => {
        const isJson = filePath.endsWith('.json');
        const isArtoon = filePath.endsWith('.artoon');

        if (!isJson && !isArtoon) {
            console.log(`Skipping: ${filePath} (not .json or .artoon)`);
            return;
        }

        try {
            processedCount++;

            if (isJson) {
                // Migrate JSON AST file
                const content = fs.readFileSync(filePath, 'utf-8');
                const oldDoc = JSON.parse(content);

                // Only migrate if version is not 2.0
                if (oldDoc.version === '2.0') {
                    console.log(`Skipping: ${filePath} (Already V2.0)`);
                    return;
                }

                const newDoc = migrateToV2(oldDoc);

                if (options.dryRun) {
                    console.log(`[DRY RUN] Would migrate: ${filePath}`);
                } else {
                    fs.writeFileSync(filePath, JSON.stringify(newDoc, null, 2), 'utf-8');
                    console.log(`Migrated: ${filePath}`);
                }
                migratedCount++;
            } else {
                // Migrate .artoon text file
                const content = fs.readFileSync(filePath, 'utf-8');
                const parsed = parse(content);

                if (parsed.errors && parsed.errors.length > 0) {
                    console.error(`Parse errors in ${filePath}:`);
                    parsed.errors.forEach(e => console.error(`  Line ${e.line}: ${e.message}`));
                    return;
                }

                // Transform parser AST to canonical AST and re-serialize with v2 formatting
                const canonicalAst = transform(parsed);

                if (options.dryRun) {
                    console.log(`[DRY RUN] Would migrate: ${filePath}`);
                } else {
                    const output = serialize(canonicalAst);
                    fs.writeFileSync(filePath, output, 'utf-8');
                    console.log(`Migrated: ${filePath}`);
                }
                migratedCount++;
            }
        } catch (e: any) {
            console.error(`Error processing ${filePath}: ${e.message}`);
        }
    };

    console.log(`Starting ARTOON AST migration ${options.dryRun ? '(DRY RUN)' : ''}...`);

    if (stat.isDirectory()) {
        const files = fs.readdirSync(targetPath);
        files.forEach(file => processFile(path.join(targetPath, file)));
    } else {
        processFile(targetPath);
    }

    console.log(`\nMigration complete.`);
    console.log(`Files processed: ${processedCount}`);
    console.log(`Files migrated: ${migratedCount}`);
}
