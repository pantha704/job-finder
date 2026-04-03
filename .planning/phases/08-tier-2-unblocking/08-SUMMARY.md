---
phase: "08"
name: "Tier 2 Unblocking"
status: complete
completed_at: 2026-04-03
one_liner: "Himalayas fixed (43 jobs), Cutshort confirmed working (120 jobs), LinkedIn auth-guard verified"
requirements-completed:
  - UBK2-02
  - UBK2-03
  - UBK2-04
---

# Phase 08 Summary: Tier 2 Unblocking

## What Was Built/Fixed

### Himalayas (UBK2-03) — Fixed
- **Problem:** Selector regex expected `/jobs/{slug}-at-{company}` but Himalayas uses `/jobs/{slug}` format
- **Fix:** Updated regex in `src/scrapers/himalayas.ts` to `/^\/jobs\/[a-z0-9-]{5,}$/` with exclusion set for non-job paths
- **Result:** 43 jobs from entry-level + web3 URLs (was 0)

### Cutshort (UBK2-04) — Already Working
- **Status:** 120 jobs across 6 URLs (20 per URL) — no changes needed
- Plain fetch works fine; no 403 observed in current run

### LinkedIn (UBK2-01, UBK2-02) — Auth Guard Verified
- **UBK2-01:** Marked Out of Scope — auth cookie injection violates "no login-gated content" constraint
- **UBK2-02:** Pipeline guard in `src/index.ts:83-84` skips LinkedIn when no cookie provided
- Log: "Skipping LinkedIn: requires --linkedin-cookie for auth"

## Verification Results

| Source | Jobs | Status |
|--------|------|--------|
| Cutshort | 120 | ✅ Working |
| Himalayas | 43 | ✅ Fixed |
| LinkedIn | 0 (skipped) | ✅ Guarded |
