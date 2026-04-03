---
phase: 06
slug: test-infrastructure
created: "2026-04-03"
status: planned
---

# Phase 06 — PLAN: Test Infrastructure

## Objective

Create a `bun test` unit test suite covering all core modules: `src/utils.ts`, `src/browser.ts`, `src/filter.ts` (via `src/filters/`), and `src/dedup.ts`. All tests must pass with `bun test`.

## Requirements

TEST-01, TEST-02, TEST-03, TEST-04, TEST-05

## Tasks

### Wave 1: Test Setup + Utils Tests (TEST-01, TEST-02)

**Task 6-01-01: Install bun test runner dependencies**
- Files: `package.json`
- Action: Ensure `bun-types` dev dependency includes test types. Add `bun:test` import support.

**Task 6-01-02: Create `src/utils.test.ts`**
- Files: `src/utils.test.ts`
- Action: Write tests for all public exports in `src/utils.ts`:
  - `delay(3000)` completes in ~3s (tolerance ±500ms) — use `Date.now()`
  - `retry()` with exponential backoff — 1st fails, 2nd succeeds → called twice
  - `retry()` max retries → throws last error
  - `checkRobotstxt("example.com")` returns correct result (mock fetch)
  - `parseRelativeDate("3 days ago")` returns correct Date
  - `normalizeCompany("Google LLC")` → "google"
  - `rotateUA()` returns different UA on consecutive calls
- Verification: `bun test src/utils.test.ts` — all green

**Task 6-01-03: Create `src/browser.test.ts`**
- Files: `src/browser.test.ts`
- Action: Write mock tests for `getBrowser()` chain:
  - Mock successful Camoufox port scan → returns connected browser
  - Mock Camoufox fails → launches local Playwright browser
  - Mock both fail → returns null with warning logged
  - Use `mock.module('playwright')` or simple function stubs
- Verification: `bun test src/browser.test.ts` — all green

### Wave 2: Filter + Dedup Tests (TEST-03, TEST-04)

**Task 6-02-01: Create `src/filters/location.test.ts`**
- Files: `src/filters/location.test.ts`
- Action:
  - `matchesLocationFilter("Remote, India")` → true for "remote-india" scope
  - `matchesLocationFilter("New York, USA")` → false for "remote-india" scope
  - `matchesLocationFilter("Work from Home")` → true
- Verification: `bun test src/filters/location.test.ts` — all green

**Task 6-02-02: Create `src/filters/experience.test.ts`**
- Files: `src/filters/experience.test.ts`
- Action:
  - `matchesExperienceFilter("Fresher")` → true for fresher scope
  - `matchesExperienceFilter("5+ years")` → false for fresher scope
  - `matchesExperienceFilter("Entry Level")` → true
- Verification: `bun test src/filters/experience.test.ts` — all green

**Task 6-02-03: Create `src/filters/skills.test.ts`**
- Files: `src/filters/skills.test.ts`
- Action:
  - `scoreSkillsMatch("Looking for Rust developer")` → HIGH MATCH for "rust"
  - `scoreSkillsMatch("Looking for trustworthy person")` → NOT matched ("trust" ≠ "rust")
  - `scoreSkillsMatch("Solana smart contracts")` → HIGH MATCH for "solana"
  - Word-boundary regex confirmed
- Verification: `bun test src/filters/skills.test.ts` — all green

**Task 6-02-04: Create `src/dedup.test.ts`**
- Files: `src/dedup.test.ts`
- Action:
  - Same job from two sources → deduped to 1
  - Different jobs → no false positives
  - 100 identical jobs → exactly 1 unique
  - Test `generateDedupKey()` and `dedupJobs()`
- Verification: `bun test src/dedup.test.ts` — all green

### Wave 3: Full Suite + Polish (TEST-05)

**Task 6-03-01: Run full test suite**
- Action: `bun test` from project root
- Must: Zero failures, zero skipped, all 5 test files green
- Add `--verbose` flag for detailed output
- Fix any failing tests
- Verification: `bun test` exits with code 0

**Task 6-03-02: Update README with test commands**
- Files: `README.md`
- Action: Add "Testing" section documenting:
  - `bun test` — run all tests
  - `bun test src/utils.test.ts` — run specific test file
- Verification: README renders correctly

## Success Criteria

1. `bun test` runs all 5 test files with zero failures
2. All public exports in utils, browser, filters, dedup have at least one test
3. Word-boundary regex verified: "trust" does NOT match "rust"
4. `delay(3000)` completes in ~3s (±500ms tolerance)
5. `retry()` exponential backoff works correctly
6. Dedup correctly handles duplicates and non-duplicates
7. `bun test` exits with code 0

## Verification

After all tasks: `bun test` must exit with code 0 and all tests green.

---
*Plan created: 2026-04-03*
