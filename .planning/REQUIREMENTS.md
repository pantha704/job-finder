# Requirements: Remote Job Aggregator

**Defined:** 2026-04-03
**Milestone:** v1.1 — Reliability & Coverage
**Core Value:** Close all gaps from v1.0 audit — unblock 6 sources, add tests, verify full pipeline, complete traceability.

## v1.1 Requirements

### Test Infrastructure

- [ ] **TEST-01**: Create `bun test` unit test suite covering `src/utils.ts` (delay, retry, robots.txt check, relative date parser, company normalizer)
- [ ] **TEST-02**: Create `src/browser.test.ts` — mock test for Browser connection chain (Camoufox → Playwright → fetch-only)
- [ ] **TEST-03**: Create `src/filter.test.ts` — test location normalization, experience matching, HIGH MATCH scoring (word-boundary regex verified: "trust" ≠ "rust")
- [ ] **TEST-04**: Create `src/dedup.test.ts` — verify SHA-256 hash dedup produces correct unique counts
- [ ] **TEST-05**: All tests pass with `bun test` (zero failures)

### Source Unblocking — Tier 1 (Wellfound)

- [x] **UBK1-01**: Wellfound scraper uses Camoufox anti-detect browser via Playwright Juggler protocol — ✅ Verified working (browser connects, requests sent)
- [ ] **UBK1-02**: Wellfound scraper extracts real job data — ❌ DataDome blocks all paths (Camoufox, Playwright, fetch). Moved to Out of Scope.
- [x] **UBK1-03**: Wellfound jobs flow through pipeline when available — ✅ Pipeline handles graceful skip correctly

### Source Unblocking — Tier 2 (LinkedIn, Cutshort, Himalayas)

- [ ] **UBK2-01**: LinkedIn scraper uses auth cookie injection — ❌ Out of scope (violates "no login-gated content" constraint). Guard in place in src/index.ts.
- [x] **UBK2-02**: LinkedIn guest API documented — ✅ Guest API requires auth cookie, guarded at pipeline level
- [x] **UBK2-03**: Himalayas scraper uses `fetchRendered` and returns non-zero results — ✅ Fixed selector regex, 43 jobs from entry-level + web3 URLs
- [x] **UBK2-04**: Cutshort scraper returns real job data — ✅ Already working (120 jobs via plain fetch)

### Source Unblocking — Tier 3 (Remotive, Jobicy, WWR)

- [ ] **UBK3-01**: Remotive scraper bypasses 403 anti-bot using headless browser (Camoufox or Playwright)
- [ ] **UBK3-02**: Jobicy scraper bypasses 403 anti-bot using headless browser
- [ ] **UBK3-03**: WeWorkRemotely scraper bypasses 403 anti-bot using headless browser

### Full Pipeline Verification

- [ ] **PIPE-01**: Full multi-source run with ALL tiers enabled produces ≥150 unique jobs after dedup+filter
- [ ] **PIPE-02**: All jobs in output have non-undefined Apply URL and Source fields (no `undefined` entries)
- [ ] **PIPE-03**: HIGH MATCH jobs correctly sorted before non-HIGH MATCH in output
- [ ] **PIPE-04**: Application tracker table shows accurate totals and source breakdown

### Traceability & Documentation

- [ ] **DOC-01**: REQUIREMENTS.md traceability table includes all v1.0 requirements with correct phase mappings (Phase 3-5 entries)
- [ ] **DOC-02**: Additional scrapers (web3career.ts, ycombinator.ts) documented in traceability and README
- [ ] **DOC-03**: CryptocurrencyJobs scraper smoke-tested with real data

## Out of Scope

| Feature | Reason |
|---------|--------|
| CAPTCHA solving / bot bypass | Ethical constraint — only legitimate anti-detect, no CAPTCHA automation |
| Scheduler / daily runs | v2.0 feature |
| SQLite persistence | v2.0 feature |
| Notification system | v2.0 feature |
| Salary/company size filters | v2.0 feature |
| CSV/JSON export | v2.0 feature |
| Application status tracking | v2.0 feature |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TEST-01 | Phase 6 | Complete |
| TEST-02 | Phase 6 | Complete |
| TEST-03 | Phase 6 | Complete |
| TEST-04 | Phase 6 | Complete |
| TEST-05 | Phase 6 | Complete |
| UBK1-01 | Phase 7 | Complete |
| UBK1-02 | Phase 7 | Out of Scope (DataDome blocks all paths) |
| UBK1-03 | Phase 7 | Complete |
| UBK2-01 | Phase 8 | Out of Scope (auth cookie = login-gated) |
| UBK2-02 | Phase 8 | Complete |
| UBK2-03 | Phase 8 | Complete |
| UBK2-04 | Phase 8 | Complete |
| UBK3-01 | Phase 9 | Pending |
| UBK3-02 | Phase 9 | Pending |
| UBK3-03 | Phase 9 | Pending |
| PIPE-01 | Phase 10 | Pending |
| PIPE-02 | Phase 10 | Pending |
| PIPE-03 | Phase 10 | Pending |
| PIPE-04 | Phase 10 | Pending |
| DOC-01 | Phase 10 | Pending |
| DOC-02 | Phase 10 | Pending |
| DOC-03 | Phase 10 | Pending |

**Coverage:**
- v1.1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-03*
