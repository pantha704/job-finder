---
phase: 09
slug: tier-3-unblocking
created: "2026-04-03"
status: planned
---

# Phase 09 — PLAN: Tier 3 Unblocking (Remotive, Jobicy, WWR)

## Objective

Attempt to unblock Remotive, Jobicy, and WeWorkRemotely using `fetchRendered()` (Camoufox/Playwright). Accept 403 as external limitation if anti-detect doesn't work.

## Requirements

UBK3-01, UBK3-02, UBK3-03

## Tasks

### Wave 1: Test All 3 with fetchRendered

**Task 9-01-01: Switch Remotive to fetchRendered**
- Files: `src/scrapers/remotive.ts`
- Action: Replace `fetch` with `fetchRendered()`, keep cheerio parsing
- Test: `bun run src/cli.ts -s remotive -R web3 -e fresher -l remote-india`
- If ≥1 jobs: keep. If 403: accept limitation, mark out of scope.

**Task 9-01-02: Switch Jobicy to fetchRendered**
- Files: `src/scrapers/jobicy.ts`
- Action: Same pattern as Remotive
- Test: `bun run src/cli.ts -s jobicy -R web3 -e fresher -l remote-india`
- If ≥1 jobs: keep. If 403: accept limitation, mark out of scope.

**Task 9-01-03: Switch WeWorkRemotely to fetchRendered**
- Files: `src/scrapers/weworkremotely.ts`
- Action: Same pattern as Remotive
- Test: `bun run src/cli.ts -s weworkremotely -R web3 -e fresher -l remote-india`
- If ≥1 jobs: keep. If 403: accept limitation, mark out of scope.

### Wave 2: Document Results

**Task 9-02-01: Update REQUIREMENTS.md**
- Files: `.planning/REQUIREMENTS.md`
- Action: Mark each UBK3 requirement as Complete (if working) or Out of Scope (if 403 persists)

## Success Criteria

1. All 3 scrapers tested with Camoufox
2. Working scrapers return ≥1 jobs
3. Blocked scrapers exit cleanly with warning
4. REQUIREMENTS.md traceability updated
5. `bun test` still passes

---
*Plan created: 2026-04-03*
