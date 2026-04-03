# Requirements: Remote Job Aggregator

**Defined:** 2026-04-03
**Core Value:** Produce a ready-to-use `job_opportunities.md` with 150+ verified remote fresher job links, with Rust/Solana/TS matches flagged, so Pratham can track and apply immediately.

## v1 Requirements

### Project Setup

- [ ] **SETUP-01**: Bun project initialized with TypeScript config, package.json, and tsconfig.json
- [ ] **SETUP-02**: Job interface defined (`title`, `company`, `applyUrl`, `location`, `experience`, `salary`, `postedDate`, `techStack`, `source`, `isHighMatch`)
- [ ] **SETUP-03**: Utility functions implemented: `delay(ms)`, `retry(fn, maxAttempts)`, `checkRobotstxt(domain)`, `parseRelativeDate(str)`, `normalizeCompany(name)`

### Browser Integration

- [ ] **BRWS-01**: Auto-detect Camoufox endpoint by scanning ports [9377, 3000, 9222, 8080] for health response
- [ ] **BRWS-02**: Connect to detected Camoufox endpoint via Playwright (Firefox/Juggler protocol, NOT Chrome CDP)
- [ ] **BRWS-03**: Fallback to headless Playwright browser launch if no Camoufox endpoint found
- [ ] **BRWS-04**: Final fallback to fetch-only mode if Playwright unavailable

### Tier 1 Scraping

- [ ] **SCR1-01**: Scrape Internshala (`/fresher-jobs/work-from-home/`) — extract job cards with cheerio
- [ ] **SCR1-02**: Scrape Wellfound (`/remote?roles=engineering&seniority=entry_level`) — JS-rendered via Playwright
- [ ] **SCR1-03**: Scrape RemoteRocketship (`/country/india/jobs/entry-level-software-engineer/`) — static fetch+cheerio
- [ ] **SCR1-04**: Scrape Unstop (`/internship?job_type=1&sort_by=1`) — JS-rendered via Playwright

### Tier 2 Scraping

- [ ] **SCR2-01**: Scrape LinkedIn (`/jobs/remote-entry-level-jobs`) — fetch with UA, handle 429/blocks gracefully
- [ ] **SCR2-02**: Scrape Cutshort (`/jobs?location=Remote&exp_min=0&exp_max=2`) — try fetch then Playwright fallback
- [ ] **SCR2-03**: Scrape Himalayas (`/jobs/india/entry-level/software-engineer`) — static fetch+cheerio

### Tier 3 Scraping (Web3/Rust/Solana)

- [ ] **SCR3-01**: Scrape Solana Jobs (`jobs.solana.com/jobs?filter=...`) — decode URL filter, extract entry-level jobs
- [ ] **SCR3-02**: Scrape CryptoCurrencyJobs (`/developer/?location=remote&experience=entry`) — fetch+cheerio

### Data Processing

- [ ] **PROC-01**: Filter jobs to remote/India-accessible positions only (location contains "Remote", "India", "Work from Home", or "Anywhere")
- [ ] **PROC-02**: Filter jobs to fresher-friendly (experience: 0-2yr OR "Fresher" OR "Internship" OR "Entry Level")
- [ ] **PROC-03**: Filter jobs to last 14 days (posted date >= 2026-03-20)
- [ ] **PROC-04**: De-duplicate jobs using SHA-256 hash of `normalizeCompany(company) + normalize(title)`
- [ ] **PROC-05**: Flag jobs with 🔥 HIGH MATCH when tech stack or description contains Rust, Solana, TypeScript, or Next.js
- [ ] **PROC-06**: Sort final list: HIGH MATCH first, then by recency descending

### Output

- [ ] **OUT-01**: Generate `job_opportunities.md` with `- [ ]` checkbox per job in format: `- [ ] **[Title]** @ [Company] | [Location] | [Exp] | [Salary] | [Date] | [🔥 HIGH MATCH] [Apply]([Link])`
- [ ] **OUT-02**: Include source tag per job entry (small note: `*Source: Internshala*`)
- [ ] **OUT-03**: Include application tracker table at bottom (Total, High Match count, Applied count, Sources breakdown)
- [ ] **OUT-04**: Report progress to console every 25 jobs extracted (running total, source count, current site)
- [ ] **OUT-05**: Print summary on completion: total scraped, total after filter, total unique, by-source breakdown

### Ethics & Error Handling

- [ ] **ETHI-01**: Check robots.txt before scraping each domain; log if inaccessible
- [ ] **ETHI-02**: Enforce 3-second minimum delay between requests to same domain
- [ ] **ETHI-03**: On CAPTCHA detection (HTTP 403, redirect to verification page): log warning, skip, continue
- [ ] **ETHI-04**: Max 3 retries per URL with exponential backoff (3s → 6s → 12s)
- [ ] **ETHI-05**: Max 10 pages per site (pagination limit)
- [ ] **ETHI-06**: User-Agent rotation from a realistic pool (Chrome/Firefox on Linux)

## v2 Requirements

### Monitoring & Scheduling
- **SCHED-01**: Cron/schedule support to re-run scraper daily
- **SCHED-02**: Delta-only output (only new jobs since last run)
- **SCHED-03**: Email/Slack/Telegram notification on new HIGH MATCH jobs

### Enhanced Filtering
- **FILT-01**: Salary range filter (min INR)
- **FILT-02**: Company size filter (startup vs enterprise)
- **FILT-03**: Exclude specific companies or domains (blacklist)

### Persistence
- **PERS-01**: SQLite/JSON store to persist seen jobs across runs
- **PERS-02**: Track application status (applied, interview, rejected) in DB

## Out of Scope

| Feature | Reason |
|---------|--------|
| CAPTCHA bypass/solving | Ethical constraint — non-negotiable |
| Auto-apply to jobs | Out of ethical + legal scope |
| Login-gated content | Unauthorized access risk |
| Non-public job data | Scrape only publicly visible listings |
| Real-time monitoring | Single-run tool for v1 |
| Mobile/web UI | Script-first, markdown output |
| Proxies/IP rotation | Keep simple for personal use; not at scale |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SETUP-01 | Phase 1 | Pending |
| SETUP-02 | Phase 1 | Pending |
| SETUP-03 | Phase 1 | Pending |
| BRWS-01 | Phase 1 | Pending |
| BRWS-02 | Phase 1 | Pending |
| BRWS-03 | Phase 1 | Pending |
| BRWS-04 | Phase 1 | Pending |
| SCR1-01 | Phase 2 | Pending |
| SCR1-02 | Phase 2 | Pending |
| SCR1-03 | Phase 2 | Pending |
| SCR1-04 | Phase 2 | Pending |
| SCR2-01 | Phase 3 | Pending |
| SCR2-02 | Phase 3 | Pending |
| SCR2-03 | Phase 3 | Pending |
| SCR3-01 | Phase 4 | Pending |
| SCR3-02 | Phase 4 | Pending |
| PROC-01 | Phase 2 | Pending |
| PROC-02 | Phase 2 | Pending |
| PROC-03 | Phase 2 | Pending |
| PROC-04 | Phase 2 | Pending |
| PROC-05 | Phase 2 | Pending |
| PROC-06 | Phase 5 | Pending |
| OUT-01 | Phase 5 | Pending |
| OUT-02 | Phase 5 | Pending |
| OUT-03 | Phase 5 | Pending |
| OUT-04 | Phase 2 | Pending |
| OUT-05 | Phase 5 | Pending |
| ETHI-01 | Phase 1 | Pending |
| ETHI-02 | Phase 1 | Pending |
| ETHI-03 | Phase 1 | Pending |
| ETHI-04 | Phase 1 | Pending |
| ETHI-05 | Phase 2 | Pending |
| ETHI-06 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 32 total
- Mapped to phases: 32
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-03*
*Last updated: 2026-04-03 after initialization*
