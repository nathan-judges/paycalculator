# Australian Salary Comparison Tool
A Next.js app for calculating and comparing Australian take-home pay (after income tax, Medicare levy, Medicare Levy Surcharge, HECS-HELP repayments, and superannuation) across financial years using an ATO-sourced, fixture-verified tax engine.

Supports side-by-side scenario comparison and shareable URLs.

## Features

- **Accurate ATO rates** — 2025-26 (ATO-verified) and 2026-27 (legislated)
- **All deductions** — income tax (Stage 3 rates), LITO, Medicare levy + phase-in, MLS (Tier 1–3), HECS-HELP (marginal repayment), super (inclusive or exclusive)
- **Compare two scenarios** — side-by-side cards with a net-pay delta badge
- **Shareable URLs** — state compressed with lz-string, validated with Zod on load
- **Persistent** — state saved to localStorage between sessions
- **Frequency display** — weekly, fortnightly, monthly, or annual

## Tech stack

| Concern | Tool |
|---------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| State | Zustand v5 + persist middleware |
| Validation | Zod v4 |
| URL compression | lz-string |
| Tests | Vitest + React Testing Library |
| Fonts | Geist Sans / Geist Mono (local) |

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # run all unit tests
npm run test:watch   # watch mode
npm run build        # production build
npm run test:coverage  # coverage report
```

## How to Update Tax Rates

See [MAINTENANCE.md](MAINTENANCE.md) for the full ATO update calendar and
step-by-step instructions. In brief:

1. Create `lib/tax-config/YYYY-YY.ts` — copy the nearest year as a template
2. Update brackets, LITO, Medicare, MLS, and HECS thresholds from official ATO publications
3. Set `lastVerifiedAgainstATO` to today's date once verified
4. Add the new `FinancialYear` value to `FinancialYearSchema` in `lib/types.ts`
5. Register the config in `lib/tax-config/index.ts`
6. Run `npm test` — ATO fixture tests will validate boundary values against ATO tables

## Project Structure

```
lib/
  engine/taxEngine.ts     Pure calculation functions (no side effects)
  tax-config/             Per-FY rate configs (single source of truth for all rates)
  types.ts                All Zod schemas and TypeScript types
  urlState.ts             lz-string compress/decompress utilities
store/
  comparisonStore.ts      Zustand store (persist middleware + Zod rehydration)
app/
  components/             Server/client boundary components
  layout.tsx              Root layout (fonts, metadata)
  page.tsx                Entry page (StateSync + QuickCheckClient)
components/               Reusable UI components (each has a .test.tsx)
tests/
  fixtures/               ATO-sourced JSON fixtures for boundary tests
  fixtures/sources/       Official ATO XLSX files (not committed — see README inside)
```

## Architecture Rules

All non-negotiable rules are enforced in `.cursorrules`:

- Tax rates live **only** in `lib/tax-config/{FY}.ts` — never hardcoded elsewhere
- All tax calculations go through `lib/engine/taxEngine.ts` — no component calculates tax directly
- All Zod schemas live **only** in `lib/types.ts`
- ATO boundary test values must be sourced from ATO tables — never generated
- `financialYear` is a global field on `AppStateSchema`, not per-scenario
- Scenario IDs are `s1` or `s2` only — no UUIDs
- URL state is lz-string compressed and Zod-validated on load
- Configs with `lastVerifiedAgainstATO: null` have their tests skipped, not failed

## Deployment

Deployed on [Vercel](https://vercel.com). Push to `main` triggers automatic deployment.
No environment variables are required for the production build.
