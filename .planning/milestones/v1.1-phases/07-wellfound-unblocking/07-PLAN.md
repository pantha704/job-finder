---
phase: 07
slug: wellfound-unblocking
created: "2026-04-03"
status: planned
---

# Phase 07 — PLAN: Wellfound Unblocking

## Objective

Unblock the Wellfound scraper by ensuring the Camoufox anti-detect browser path works correctly, verifying selectors extract real job data, and confirming jobs flow through the full pipeline.

## Requirements

UBK1-01, UBK1-02, UBK1-03

## Tasks

### Wave 1: Verify and Fix Wellfound Scraper (UBK1-01, UBK1-02)

**Task 7-01-01: Test Wellfound with Camoufox available**
- Files: `src/scrapers/wellfound.ts`, `src/browser.ts`
- Action:
  - Ensure Camoufox is running (`camoufox` command or check port 9377)
  - Run `bun run src/index.ts -s wellfound` (single-source scrape)
  - Verify Camoufox path is taken (log: "Camoufox detected on port 9377")
  - Verify jobs are extracted (non-zero count)
  - If 0 jobs: inspect rendered HTML, fix selectors
  - If Cloudflare challenge: verify Camoufox anti-detect is working (check fingerprint headers)
- Verification: `bun run src/index.ts -s wellfound` returns ≥1 jobs

**Task 7-01-02: Fix Wellfound selectors if needed**
- Files: `src/scrapers/wellfound.ts`
- Action (only if Task 7-01-01 returns 0 jobs):
  - Log the full HTML response to a temp file for inspection
  - Identify correct job card selectors in Wellfound's DOM
  - Update selector array with working patterns
  - Test again with `bun run src/index.ts -s wellfound`
- Verification: Non-zero job count from Wellfound

**Task 7-01-03: Test graceful fallback without Camoufox**
- Files: `src/scrapers/wellfound.ts`
- Action:
  - Stop Camoufox server (if running)
  - Run `bun run src/index.ts -s wellfound`
  - Verify log shows: "Camoufox not available" and "Cloudflare challenge" warning
  - Verify scraper returns empty array (not crash)
- Verification: Clean exit, warning logged, no crash

### Wave 2: Pipeline Integration (UBK1-03)

**Task 7-02-01: Verify Wellfound jobs flow through pipeline**
- Files: `src/index.ts`, `src/filters/location.ts`, `src/filters/experience.ts`, `src/filters/skills.ts`, `src/dedup.ts`
- Action:
  - Run full pipeline with Wellfound enabled: `bun run src/index.ts -s wellfound`
  - Verify jobs pass location filter (remote/India check)
  - Verify jobs pass experience filter (fresher/entry-level check)
  - Verify HIGH MATCH flag fires for Rust/Solana/TypeScript jobs
  - Verify no duplicate Wellfound jobs in output
- Verification: Wellfound jobs appear in `job_opportunities.md` with correct formatting

**Task 7-02-02: Add Wellfound integration test**
- Files: `src/scrapers/wellfound.test.ts` (new)
- Action:
  - Create test that mocks `fetchRendered` response with known Wellfound HTML
  - Verify `scrapeWellfound()` extracts correct job data
  - Test Cloudflare challenge detection path
- Verification: `bun test src/scrapers/wellfound.test.ts` — all green

## Success Criteria

1. Wellfound scraper returns ≥1 jobs when Camoufox is available
2. Wellfound scraper exits cleanly (no crash, logs warning) when Camoufox unavailable
3. Wellfound jobs appear in final `job_opportunities.md` output
4. Wellfound jobs with Rust/Solana/TypeScript flagged as HIGH MATCH
5. No duplicate Wellfound jobs in output
6. `bun test` still passes (96+ tests)

## Verification

After all tasks: `bun run src/index.ts -s wellfound` returns non-zero jobs when Camoufox available, and `bun test` passes.

---
*Plan created: 2026-04-03*
