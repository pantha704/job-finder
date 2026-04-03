---
phase: 08
slug: tier-2-unblocking
created: "2026-04-03"
status: planned
---

# Phase 08 — PLAN: Tier 2 Unblocking (LinkedIn, Cutshort, Himalayas)

## Objective

Unblock LinkedIn (429 rate-limit), Cutshort (403 anti-bot), and Himalayas (React SPA 0 results).

## Requirements

UBK2-01 (out of scope), UBK2-02, UBK2-03, UBK2-04

## Tasks

### Wave 1: Test and Fix Cutshort (UBK2-04)

**Task 8-01-01: Switch Cutshort to fetchRendered (Camoufox/Playwright)**
- Files: `src/scrapers/cutshort.ts`
- Action:
  - Replace plain `fetch` calls with `fetchRendered()` from `src/browser.ts`
  - Keep existing cheerio parsing logic
  - Keep 5s delay between requests
  - Keep robots.txt check
- Verification: `bun run src/cli.ts -s cutshort -R web3 -e fresher -l remote-india` returns ≥1 jobs

**Task 8-01-02: Test Cutshort with and without Camoufox**
- Files: `src/scrapers/cutshort.ts`
- Action:
  - With Camoufox running: verify non-zero jobs
  - Without Camoufox: verify Playwright fallback works
  - Log which method was used for each URL
- Verification: Non-zero jobs with Camoufox, Playwright fallback confirmed

### Wave 2: Fix Himalayas (UBK2-03)

**Task 8-02-01: Diagnose Himalayas zero-results issue**
- Files: `src/scrapers/himalayas.ts`
- Action:
  - Run with verbose logging: log HTML content length and first 500 chars
  - Check if `fetchRendered()` returns SSR HTML or challenge page
  - If SSR HTML: fix selectors to match actual job card structure
  - If challenge page: try Playwright path explicitly
- Verification: Understand why 0 results (selectors wrong vs page blocked)

**Task 8-02-02: Fix Himalayas selectors**
- Files: `src/scrapers/himalayas.ts`
- Action:
  - Based on Task 8-02-01 findings, update selectors
  - Himalayas uses clean URL pattern: `/jobs/{job-slug}-at-{company-slug}`
  - Try broader selectors: `article`, `li`, any `a[href*="/jobs/"]`
- Verification: `bun run src/cli.ts -s himalayas -R web3 -e fresher -l remote-india` returns ≥1 jobs

### Wave 3: LinkedIn Documentation (UBK2-01, UBK2-02)

**Task 8-03-01: Mark UBK2-01 as Out of Scope**
- Files: `.planning/REQUIREMENTS.md`
- Action:
  - Mark UBK2-01 (auth cookie injection) as out of scope — violates "no login-gated content" constraint
  - Update traceability table

**Task 8-03-02: Test LinkedIn guest API and document**
- Files: `src/scrapers/linkedin.ts`
- Action:
  - Run scraper, document 429 behavior
  - Add 5s delay between LinkedIn requests (was using default)
  - Reduce URLs from 5 to 3 (most targeted ones)
  - If guest API returns data on some runs: document as "intermittently available"
  - If consistently 429: document as rate-limit limitation
- Verification: Clean exit, appropriate warning logged

## Success Criteria

1. Cutshort returns ≥1 jobs with Camoufox or Playwright
2. Himalayas returns ≥1 jobs (selectors fixed or Playwright working)
3. LinkedIn documented: either intermittently working or rate-limit limitation accepted
4. `bun test` still passes (96+ tests)
5. All Tier 2 scrapers exit cleanly (no crashes)

## Verification

After all tasks: `bun run src/cli.ts -s cutshort,himalayas,linkedin -R web3 -e fresher -l remote-india` — Cutshort and Himalayas return ≥1 jobs each, LinkedIn exits cleanly.

---
*Plan created: 2026-04-03*
