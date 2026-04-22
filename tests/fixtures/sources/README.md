# ATO Source Files

This directory contains the official ATO XLSX files used to generate test fixtures and verify tax calculations.

## Required Files

| File | ATO Reference | Description |
|------|---------------|-------------|
| `NAT_1004_2025-26.xlsx` | NAT 1004 | Schedule of PAYG withholding — regular payments |
| `NAT_3539_2025-26.xlsx` | NAT 3539 | Schedule of STSL (study and training support loans) repayments |

## Download Instructions

1. Visit [ATO Software Developers](https://softwaredevelopers.ato.gov.au)
2. Navigate to: Tax tables → Current tax tables
3. Download the relevant XLSX files for the financial year
4. Place them in this directory with the naming convention above

## Verification

After downloading, record the SHA-256 checksums:

```bash
shasum -a 256 *.xlsx > checksums.sha256
```

CI will verify these checksums on every build to ensure the source files have not been modified.

## Usage

Run `parse-ato-fixtures.ts` to convert XLSX files into JSON test fixtures:

```bash
npx tsx tests/scripts/parse-ato-fixtures.ts
```

Output will be written to `tests/fixtures/ato-2025-26.json`.
