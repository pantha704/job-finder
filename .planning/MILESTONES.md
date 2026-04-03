---
milestone: v1.1
name: "Reliability & Coverage"
shipped: "2026-04-03"
status: shipped
---

# Milestones

## v1.1 — Reliability & Coverage

**Shipped:** 2026-04-03
**Phases:** 5 | **Plans:** 5
**Tests:** 96 passing
**Published:** @pantha704/job-finder@1.0.7

### What Was Built
- Created 96 unit tests across 6 files (utils, browser, location, experience, skills, dedup)
- Fixed Himalayas scraper (selector regex → 43 jobs)
- Verified Cutshort working (120 jobs)
- Documented 6 blocked sources as accepted external limitations
- Verified full pipeline: 303+ projected jobs, zero undefined fields

### Key Accomplishments
1. **96 Tests** — Full unit test coverage for all core modules
2. **Himalayas Fixed** — 43 jobs extracted (was 0)
3. **Pipeline Verified** — 303+ projected jobs, correct sorting and formatting
4. **All Limitations Documented** — External anti-bot limitations accepted

### Known Gaps
- 6 blocked sources (Wellfound DataDome, LinkedIn auth, Remotive/Jobicy/WWR anti-bot)

---

## v1.0 — Single-Run Job Scraper

**Shipped:** 2026-04-03
**Phases:** 5 | **Plans:** 5
**LOC:** 3,154 TypeScript
**Published:** @pantha704/job-finder@1.0.7

### What Was Built
- Bootstrapped Bun+TypeScript project with Camoufox browser chain and ethics infrastructure
- Implemented 16 job board scrapers across 3 tiers
- Built complete filter/dedup/scoring pipeline with HIGH MATCH detection
- Generated job_opportunities.md with 254 jobs (22 HIGH MATCH)
- Published as @pantha704/job-finder@1.0.7 on npm

### Key Accomplishments
1. **Foundation & Ethics** — Bun+TypeScript bootstrapped with 3s ethical delays, robots.txt compliance
2. **16 Scrapers** — All tiers implemented with graceful fallback for blocked sources
3. **Pipeline** — Filter/dedup/scoring with word-boundary HIGH MATCH detection
4. **Published CLI** — @pantha704/job-finder@1.0.7 on npm
5. **Output** — 254 unique jobs, 22 HIGH MATCH, sorted by relevance

### Known Gaps
- Blocked sources: Wellfound (CAPTCHA), Remotive/Jobicy/WWR (403), LinkedIn (429)
- No unit test suite
- REQUIREMENTS.md traceability incomplete for Phase 3-5

---
