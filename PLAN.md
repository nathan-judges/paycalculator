# Project Roadmap — Australian Salary Comparison Tool

## Status Overview

| Week | Feature | Branch | Status |
|------|---------|--------|--------|
| 1 | Tax engine (2025-26), ATO fixture verification, TDD foundation | `feature/tax-engine-2025-26` | ✅ Complete — merged to main |
| 2 | Zustand store, localStorage persistence, lz-string URL compression, 2026-27 config | `feature/state-url-persistence` | ✅ Complete — merged to main |
| 3 | Quick Check single-scenario UI (all 9 components + tests) | `feature/ui-quick-check` | ✅ Complete — merged to main |
| 4 | Comparison mode — side-by-side ScenarioCards, DeltaBadge, MobileTabSwitcher | `feature/comparison-mode` | ✅ Complete — merged to main |
| 5 | Export/share, error states, visual polish, StateSync tests | `feature/week-5-polish` | 🔜 Next |
| 6 | E2E tests (Playwright), PWA manifest + service worker, CI hardening | `feature/week-6-ci-e2e` | 🔜 Planned |

---

## Week 5 Scope

### Must-have
- [ ] Share/export — "Copy link" button using the existing `buildStateSearch` utility
- [ ] Error boundary — React error boundary around the calculator, with fallback UI
- [ ] Input validation UI — surface Zod errors inline (e.g., salary out of range)
- [ ] Toast for corrupted URL state — already exists in StateSync but needs a test
- [ ] StateSync.tsx unit test (technical debt from Week 3)

### Nice-to-have (if time allows)
- [ ] PWA `public/manifest.json` + `<link rel="manifest">` in layout
- [ ] Print stylesheet or PDF export

---

## Week 6 Scope

- [ ] Playwright E2E scaffold (`tests/e2e/`) — at minimum one smoke test
- [ ] CI: GitHub Actions workflow to run `npm test` + `npm run build` on every PR
- [ ] CI: Weekly hash-check of ATO tax tables page (alert on change)
- [ ] ATO XLSX parse script (`tests/scripts/parse-ato-fixtures.ts`)
- [ ] `tests/fixtures/sources/checksums.sha256` after sourcing NAT 1004 / NAT 3539

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
