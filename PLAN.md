# Project Roadmap — Australian Salary Comparison Tool

## Status Overview

| Week | Feature | Branch | Status |
|------|---------|--------|--------|
| 1 | Tax engine (2025-26), ATO fixture verification, TDD foundation | `feature/tax-engine-2025-26` | ✅ Complete — merged to main |
| 2 | Zustand store, localStorage persistence, lz-string URL compression, 2026-27 config | `feature/state-url-persistence` | ✅ Complete — merged to main |
| 3 | Quick Check single-scenario UI (all 9 components + tests) | `feature/ui-quick-check` | ✅ Complete — merged to main |
| 4 | Comparison mode — side-by-side ScenarioCards, DeltaBadge, MobileTabSwitcher | `feature/comparison-mode` | ✅ Complete — merged to main |
| 5 | Export/share, error states, visual polish, PWA | `feature/week5-polish` | ✅ Complete — ready for PR |
| 6 | Production readiness, testing, and maintenance automation | `feature/week6-production` | ✅ Complete (current branch) |

---

## Week 5 Scope

### Must-have
- [x] Share/export — copy share link and export scenarios as CSV
- [x] Error boundary — route-level error boundary with “clear data” reset
- [x] Unverified financial year warning — dismissible + persisted in localStorage
- [x] Tooltips — accessible, no external library
- [x] Print stylesheet — hide interactive controls and add print header

### Nice-to-have (if time allows)
- [x] PWA `public/manifest.json` + manifest metadata + service worker (`next-pwa`)

---

## Week 6 Scope

- [x] Playwright E2E scaffold (`tests/e2e/`) with responsive, touch target, a11y, PWA, and visual coverage
- [x] CI workflow to run unit tests, E2E, a11y, and build
- [x] Weekly ATO hash-check workflow (issue created on change)
- [x] ATO XLSX parse script (`tests/scripts/parse-ato-fixtures.ts`)
- [x] Fixture checksum map (`tests/fixtures/sources/.checksums.json`)

---

## Future enhancements

- Add first-party analytics ingestion endpoint for aggregated privacy-safe metrics
- Expand schema migration framework when `AppStateSchema.version` changes
- Add physical-device PWA install checks for iOS and Android before major releases

---

## Deviations from Original Plan

| Item | Original Plan | Actual | Notes |
|------|--------------|--------|-------|
| HECS model | Flat percentage | Marginal (ATO 2025-26 spec) | Corrected after reading ATO tables — marginal is accurate |
| Vitest setup | `require()` in setup.ts | Async `import()` IIFE | ESM-only Vitest 4 doesn't allow synchronous require |
| StoreStatus.tsx | Persist through Week 3 | Deleted in pre-Week-5 tidy | Never imported after Week 2 — confirmed dead code |

---

## Architecture Decisions

### Why `s1`/`s2` IDs (not UUIDs)?
URL state is compressed with lz-string — short IDs meaningfully reduce URL length and make the compressed state debuggable.

### Why `financialYear` is global?
Comparing two scenarios under different tax years would produce a misleading delta. A single global FY ensures the comparison is apples-to-apples.

### Why Zod for URL parsing?
`window.location.search` is user-controlled input. Zod safeParse ensures any tampered or stale URL state is discarded gracefully rather than crashing the store.
