import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import * as XLSX from 'xlsx';

const ROOT = process.cwd();
const SOURCES_DIR = path.join(ROOT, 'tests/fixtures/sources');
const CHECKSUMS_PATH = path.join(SOURCES_DIR, '.checksums.json');
const OUTPUT_PATH = path.join(ROOT, 'tests/fixtures/ato-2025-26.json');

type ChecksumMap = Record<string, string>;

function sha256(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

function ensureChecksumFile(): ChecksumMap {
  if (!fs.existsSync(CHECKSUMS_PATH)) {
    fs.writeFileSync(CHECKSUMS_PATH, JSON.stringify({}, null, 2));
    return {};
  }

  const raw = fs.readFileSync(CHECKSUMS_PATH, 'utf-8');
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('.checksums.json must contain an object map');
  }
  return parsed as ChecksumMap;
}

function readXlsxPreview(filePath: string): unknown {
  const workbook = XLSX.readFile(filePath);
  const firstSheetName = workbook.SheetNames[0];
  const firstSheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json(firstSheet, { header: 1 }).slice(0, 5);
}

function run(): void {
  const checksums = ensureChecksumFile();
  const xlsxFiles = fs
    .readdirSync(SOURCES_DIR)
    .filter((fileName) => fileName.toLowerCase().endsWith('.xlsx'));

  if (xlsxFiles.length === 0) {
    // Keep the script deterministic when source files are not present yet.
    process.stdout.write('No XLSX files found, fixture output left unchanged.\n');
    return;
  }

  for (const fileName of xlsxFiles) {
    const fullPath = path.join(SOURCES_DIR, fileName);
    const expected = checksums[fileName];
    if (!expected) {
      throw new Error(`Missing checksum entry for ${fileName}`);
    }
    const actual = sha256(fullPath);
    if (actual !== expected) {
      throw new Error(`Checksum mismatch for ${fileName}`);
    }
  }

  const previews = xlsxFiles.map((fileName) => ({
    fileName,
    previewRows: readXlsxPreview(path.join(SOURCES_DIR, fileName)),
  }));

  const existingFixture = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8')) as Record<
    string,
    unknown
  >;
  const nextFixture = {
    ...existingFixture,
    _meta: {
      ...(existingFixture._meta as Record<string, unknown>),
      parsedAt: new Date().toISOString(),
      sources: previews,
    },
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(nextFixture, null, 2) + '\n', 'utf-8');
  process.stdout.write(`Updated ${OUTPUT_PATH}\n`);
}

run();
