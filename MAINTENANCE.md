# Maintenance Guide — Australian Salary Comparison Tool

This document covers the ongoing maintenance requirements for keeping tax calculations accurate and ATO-verified.

---

## ATO Update Calendar

| Month | Event | Action Required |
|-------|-------|-----------------|
| **May** | Federal Budget announced | Review any announced tax changes. Update `PLAN.md` with new rates if legislated. |
| **Mid-June** | ATO publishes updated XLSX files (NAT 1004, NAT 3539) for the coming FY | Download new files → `tests/fixtures/sources/`. Run `tests/scripts/parse-ato-fixtures.ts`. Update checksums. |
| **1 July** | New financial year begins | Ensure new FY config exists in `lib/tax-config/`. Set as default `financialYear`. Update `lastVerifiedAgainstATO` date. |
| **December** | Mid-Year Economic and Fiscal Outlook (MYEFO) | Review for any mid-year tax changes (rare but possible). |

---

## Legislated Future Rate Changes

### 2026-27 (from 1 July 2026)
- $18,201–$45,000 bracket: **16% → 15%**
- All other brackets, LITO, Medicare, MLS, HECS: unchanged (pending ATO confirmation)
- Config file: `lib/tax-config/2026-27.ts` — `lastVerifiedAgainstATO: null`

### 2027-28 (from 1 July 2027)
- $18,201–$45,000 bracket: **15% → 14%**
- Config file: not yet created

---

## ATO XLSX File Verification

### Source Files
- **NAT 1004**: Schedule of PAYG withholding — regular payments
- **NAT 3539**: Schedule of STSL (study and training support loans) repayments

### Required XLSX files by year

| File | Year | Status |
|------|------|--------|
| `NAT_1004_2025-26.xlsx` | 2025-26 | ⚠️ Not yet downloaded — needed to generate `tests/fixtures/ato-2025-26.json` boundary values |
| `NAT_3539_2025-26.xlsx` | 2025-26 | ⚠️ Not yet downloaded |
| `NAT_1004_2026-27.xlsx` | 2026-27 | ❌ Not yet published by ATO (expected mid-June 2026) |
| `NAT_3539_2026-27.xlsx` | 2026-27 | ❌ Not yet published by ATO (expected mid-June 2026) |

### Storage
Files stored in `tests/fixtures/sources/` with SHA-256 checksums recorded in `tests/fixtures/sources/checksums.sha256`.

### CI Verification
GitHub Actions workflow verifies:
1. All expected XLSX files exist in `tests/fixtures/sources/`
2. SHA-256 checksums match recorded values
3. Parsed JSON fixtures are up to date

---

## Schema Versioning

The `AppStateSchema` includes a `version` field (currently `1`). When the schema changes:

1. Increment the version number in the new schema
2. Write a migration function in `lib/storage.ts` that transforms `version: N` → `version: N+1`
3. Apply migrations sequentially during URL parsing and localStorage loading
4. Never delete old migration functions — URLs with old versions may still be shared

---

## Proactive Monitoring

- **ATO Software Developers mailing list**: Subscribe at softwaredevelopers.ato.gov.au for advance notice of rate changes and new XLSX releases.
- **GitHub Action (weekly)**: Hashes the ATO tax tables page content. Opens a GitHub Issue if the hash changes, alerting maintainers to check for updates.
- **Sentry**: Monitors runtime errors. Any spike in calculation-related errors should trigger immediate investigation.

---

## Super Guarantee Rate History

| Financial Year | SG Rate |
|---------------|---------|
| 2024-25 | 11.5% |
| 2025-26 | 12% |
| 2026-27+ | 12% (capped at legislated maximum) |

---

## Current Project Status

Last updated: 2026-04-22

| Week | Feature | Status |
|------|---------|--------|
| 1 | Tax engine (2025-26) + ATO fixture verification | ✅ Complete |
| 2 | Zustand store, localStorage, URL compression, 2026-27 config | ✅ Complete |
| 3 | Quick Check single-scenario UI | ✅ Complete |
| 4 | Comparison mode (side-by-side cards, DeltaBadge, MobileTabSwitcher) | ✅ Complete |
| 5 | Export/share, error states, polish | 🔜 Next |
| 6 | E2E tests (Playwright), PWA, CI hardening | 🔜 Planned |

### ATO verification status

| Config | `lastVerifiedAgainstATO` | Notes |
|--------|--------------------------|-------|
| `lib/tax-config/2025-26.ts` | `2026-04-22` | ✅ Rates verified against ATO website |
| `lib/tax-config/2026-27.ts` | `null` | ⚠️ Legislated only — ATO XLSX not yet published. Tests skipped per `.cursorrules` rule 8. |
