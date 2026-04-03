---
phase: 06
slug: test-infrastructure
created: "2026-04-03"
milestone: v1.1
---

# Phase 06 — CONTEXT: Test Infrastructure

## Domain

Create a `bun test` unit test suite covering all core modules: `utils.ts`, `browser.ts`, `filter.ts`, and `dedup.ts`. Establish testing patterns that carry forward to all subsequent phases.

## Canonical Refs

- `.planning/REQUIREMENTS.md` — TEST-01 through TEST-05 requirements
- `src/utils.ts` — delay(), retry(), checkRobotstxt(), parseRelativeDate(), normalizeCompany(), rotateUA()
- `src/browser.ts` — getBrowser() with Camoufox → Playwright → fetch-only chain
- `src/filters/location.ts` — normalizeLocation(), matchesLocationFilter()
- `src/filters/experience.ts` — normalizeExperience(), matchesExperienceFilter()
- `src/filters/skills.ts` — scoreSkillsMatch()
- `src/dedup.ts` — generateDedupKey(), dedupJobs()

## Decisions

### Test Framework
- **Use `bun test`** — no Jest, Vitest, or other runners. Bun has built-in test framework.
- **No test config file needed** — bun uses default setup (finds `*.test.ts` in project root).
- **Test files live alongside source** — `src/utils.test.ts`, `src/browser.test.ts`, etc.

### Mocking Strategy
- **No external mocking library** — use Bun's built-in `jest.mock`-compatible `mock.module()` or simple function stubs.
- **Network calls** — use `bun:sqlite` or in-memory fakes; never hit real endpoints during unit tests.
- **Browser module** — mock Playwright connection, do not launch real browser in unit tests.

### Coverage Expectations
- **Minimum 80% line coverage** per module under test
- **All public exports** must have at least one test
- **Edge cases** tested: empty input, malformed dates, special characters in company names, hash collisions in dedup

### Test Requirements by Module

**utils.test.ts (TEST-01):**
- `delay(3000)` completes in ~3 seconds (use `Date.now()` difference, tolerance ±500ms)
- `retry()` with exponential backoff: 1st attempt fails, 2nd succeeds → called twice
- `retry()` hits max retries → throws with last error
- `checkRobotstxt("example.com")` returns correct result
- `parseRelativeDate("3 days ago")` returns correct Date object
- `normalizeCompany("Google LLC")` → "google"
- `rotateUA()` returns different User-Agent on consecutive calls

**browser.test.ts (TEST-02):**
- `getBrowser()` returns a browser-like object (mocked)
- Camoufox path: mock port scan succeeds → returns connected browser
- Playwright fallback: mock Camoufox fails → launches local browser
- Fetch-only fallback: mock both above fail → returns null with warning logged

**filter.test.ts (TEST-03):**
- `matchesLocationFilter("Remote, India")` → true for "remote-india" scope
- `matchesLocationFilter("New York, USA")` → false for "remote-india" scope
- `matchesLocationFilter("Work from Home")` → true
- `matchesExperienceFilter("Fresher")` → true for fresher scope
- `matchesExperienceFilter("5+ years")` → false for fresher scope
- `scoreSkillsMatch("Looking for Rust developer")` → HIGH MATCH for "rust" in highlights
- `scoreSkillsMatch("Looking for trustworthy person")` → NOT matched (word boundary check: "trust" ≠ "rust")
- `scoreSkillsMatch("Solana smart contracts")` → HIGH MATCH for "solana" in highlights

**dedup.test.ts (TEST-04):**
- Same job from two sources → deduped to 1
- Different jobs → no false positives
- 100 identical jobs → exactly 1 unique

**All tests green (TEST-05):**
- `bun test` exits with code 0
- Zero failures, zero skipped

### Output Format
- Console test output: standard bun test reporter (dot mode for CI, verbose for dev)
- No custom reporters needed

## Defer
- Integration tests (testing actual scrapers against live sites) — future milestone
- E2E tests (full pipeline run) — future milestone
- Performance benchmarks — future milestone
- Coverage report generation (HTML) — not needed for v1.1

## Scope Creep Guard
This phase is **unit tests only**. No changes to scraper logic, no new features, no pipeline modifications. Tests verify existing behavior.

---
*Context created: 2026-04-03*
