# Incident Response Runbook

## ATO rate changes

1. Confirm change against official ATO publication.
2. Create/update tax config under `lib/tax-config/`.
3. Update fixtures via `npm run parse-fixtures`.
4. Run unit + E2E + build checks.
5. Deploy and announce impacted financial years.

## URL state failures

1. Capture the failing URL from user reports.
2. Reproduce locally with `StateSync` enabled.
3. Validate parse result against `AppStateSchema`.
4. If schema changed, implement migration before release.
5. Add regression tests for malformed/stale URL payloads.

## PWA cache issues

1. Confirm service worker registration and scope in browser devtools.
2. Validate offline shell via Playwright offline reload test.
3. Bump app version/deploy to trigger cache refresh if needed.
4. Document workaround (hard refresh / remove app data) for users.

## User report of wrong tax calculation

1. Request scenario inputs (salary, super inclusive, HECS, private health, FY).
2. Recalculate with `calculateNetIncome` in isolation.
3. Compare against ATO fixture boundaries for relevant FY.
4. If mismatch confirmed, patch config/engine with tests first.
5. Publish correction note and verify deployed output.

## Onboarding tooltip not dismissing

1. Confirm browser allows localStorage (private mode restrictions can block persistence).
2. Check if `hasSeenSalaryTooltip` exists in localStorage and equals `"true"`.
3. Reproduce dismissal paths: first keypress/click on salary input and 5-second auto-dismiss.
4. If stuck visible, clear localStorage and reload to verify listener lifecycle.
5. Add console traces in `OnboardingTooltip` for attach/detach handlers when debugging event propagation issues.
