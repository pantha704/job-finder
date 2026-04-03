# ROADMAP.md — Remote Job Aggregator

**Milestone:** v1.0 — Single-Run Job Scraper
**Total Phases:** 5
**Requirements Mapped:** 32 / 32 ✓
**Granularity:** Standard

---

## Phase 1: Foundation — Project Setup, Ethics & Browser

**Goal:** Bootstrap the Bun+TypeScript project with all utilities, ethics infrastructure, and browser connection established so subsequent phases can scrape immediately.

**Requirements:** SETUP-01, SETUP-02, SETUP-03, BRWS-01, BRWS-02, BRWS-03, BRWS-04, ETHI-01, ETHI-02, ETHI-03, ETHI-04, ETHI-06

**Plans:**
1. Initialize Bun project (`package.json`, `tsconfig.json`, install `playwright`, `cheerio`)
2. Define `types.ts` (Job interface, ScrapeResult, ErrorLog)
3. Implement `utils.ts` (delay, retry/backoff, robots.txt checker, relative date parser, company normalizer, UA rotation pool)
4. Implement `browser.ts` (Camoufox port detection → Playwright connect → local launch → fetch-only fallback chain)

**Success Criteria:**
1. `bun run src/index.ts` executes without errors (empty job list OK)
2. `browser.ts` logs: "Camoufox detected at port X" or "Using fetch-only mode"
3. Robots.txt is checked for test domain and result logged
4. `delay(3000)` is demonstrably 3 seconds (test with console timestamps)
5. `parseRelativeDate("3 days ago")` returns correct `Date` object

---

## Phase 2: Tier 1 Scraping + Data Processing Pipeline

**Goal:** Scrape all 4 Tier 1 sources (Internshala, Wellfound, RemoteRocketship, Unstop) and build the complete data processing pipeline (filter, dedup, HIGH MATCH flag, progress reporting).

**Requirements:** SCR1-01, SCR1-02, SCR1-03, SCR1-04, PROC-01, PROC-02, PROC-03, PROC-04, PROC-05, OUT-04, ETHI-05

**Plans:**
1. Implement `scrapers/internshala.ts` (fetch + cheerio, pagination up to 10 pages)
2. Implement `scrapers/remoterocketship.ts` (fetch + cheerio)
3. Implement `scrapers/wellfound.ts` (Playwright, wait for job cards, pagination)
4. Implement `scrapers/unstop.ts` (Playwright, internship filter applied)
5. Implement `filter.ts` (remote/India filter, fresher filter, 14-day recency filter)
6. Implement `dedup.ts` (SHA-256 hash set, normalize function)
7. Implement HIGH MATCH detection in filter.ts (Rust|Solana|TypeScript|Next.js keyword scan)
8. Wire progress reporting in `index.ts` (console log every 25 jobs)

**Success Criteria:**
1. Combined Tier 1 produces ≥ 50 unique jobs after dedup+filter
2. All jobs have `applyUrl` that opens a valid page (spot check 5)
3. No job with experience > 2 years passes the filter
4. HIGH MATCH flag correctly set on a TypeScript role (manual spot check)
5. Progress output appears every 25 jobs: "Progress: 25 jobs found | Source: Internshala"

---

## Phase 3: Tier 2 Scraping (LinkedIn, Cutshort, Himalayas)

**Goal:** Add all 3 Tier 2 sources with graceful handling for LinkedIn's anti-bot measures.

**Requirements:** SCR2-01, SCR2-02, SCR2-03

**Plans:**
1. Implement `scrapers/linkedin.ts` (fetch with UA rotation; detect and handle 429/redirect gracefully; log skip if blocked)
2. Implement `scrapers/cutshort.ts` (fetch first; if empty try Playwright; XHR intercept if available)
3. Implement `scrapers/himalayas.ts` (static fetch + cheerio)

**Success Criteria:**
1. LinkedIn scraper exits cleanly even when blocked (no crash, logs warning)
2. Combined Tier 1+2 produces ≥ 100 unique jobs after dedup+filter
3. At least 1 job from each of Cutshort and Himalayas in output (confirms connectivity)
4. No duplicate job from LinkedIn appears that was already captured from Tier 1

---

## Phase 4: Tier 3 Web3/Rust/Solana Scraping

**Goal:** Add both Web3-focused sources and ensure Rust/Solana jobs are discovered and properly HIGH MATCH flagged.

**Requirements:** SCR3-01, SCR3-02

**Plans:**
1. Implement `scrapers/solana-jobs.ts` (decode URL filter `{"seniority":["entry_level","internship"]}`, fetch, parse JSON or HTML)
2. Implement `scrapers/cryptocurrencyjobs.ts` (fetch + cheerio, `?location=remote&experience=entry`)

**Success Criteria:**
1. At least 1 Solana Jobs listing in output (confirms URL filter decoding worked)
2. At least 1 CryptoCurrencyJobs listing in output
3. All Rust/Solana jobs are flagged with 🔥 HIGH MATCH
4. Total unique jobs after Tier 1+2+3 ≥ 130

---

## Phase 5: Output Formatting, Sorting & Final Run

**Goal:** Generate the final `job_opportunities.md` with proper sorting (HIGH MATCH + recency), application tracker table, and achieve the 150+ job success threshold.

**Requirements:** PROC-06, OUT-01, OUT-02, OUT-03, OUT-05

**Plans:**
1. Implement `formatter.ts` (markdown checklist generator, job entry template, tracker table)
2. Implement final sort in `index.ts` (HIGH MATCH first, then newest first)
3. Wire full pipeline in `index.ts` (all tiers sequential → filter → dedup → sort → formatter.write)
4. Run full scrape, verify 150+ unique jobs, fix any broken scrapers found
5. Write `job_opportunities.md` to project root

**Success Criteria:**
1. `job_opportunities.md` exists and has ≥ 150 `- [ ]` entries
2. All `- [ ]` entries have valid Apply link URLs (not placeholder)
3. HIGH MATCH jobs appear before non-HIGH MATCH in output
4. Application tracker table at bottom shows correct totals
5. No job appears twice (duplicate check by grepping company+title)
6. At least 5 jobs flagged 🔥 HIGH MATCH (Rust/Solana/TS/Next.js)

---

## Requirement Coverage

| Requirement | Phase |
|-------------|-------|
| SETUP-01 | Phase 1 |
| SETUP-02 | Phase 1 |
| SETUP-03 | Phase 1 |
| BRWS-01 | Phase 1 |
| BRWS-02 | Phase 1 |
| BRWS-03 | Phase 1 |
| BRWS-04 | Phase 1 |
| ETHI-01 | Phase 1 |
| ETHI-02 | Phase 1 |
| ETHI-03 | Phase 1 |
| ETHI-04 | Phase 1 |
| ETHI-06 | Phase 1 |
| SCR1-01 | Phase 2 |
| SCR1-02 | Phase 2 |
| SCR1-03 | Phase 2 |
| SCR1-04 | Phase 2 |
| PROC-01 | Phase 2 |
| PROC-02 | Phase 2 |
| PROC-03 | Phase 2 |
| PROC-04 | Phase 2 |
| PROC-05 | Phase 2 |
| OUT-04 | Phase 2 |
| ETHI-05 | Phase 2 |
| SCR2-01 | Phase 3 |
| SCR2-02 | Phase 3 |
| SCR2-03 | Phase 3 |
| SCR3-01 | Phase 4 |
| SCR3-02 | Phase 4 |
| PROC-06 | Phase 5 |
| OUT-01 | Phase 5 |
| OUT-02 | Phase 5 |
| OUT-03 | Phase 5 |
| OUT-05 | Phase 5 |

**Coverage:** 32/32 ✓ — 100% of v1 requirements mapped

---
*Roadmap created: 2026-04-03*
