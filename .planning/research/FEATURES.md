# FEATURES.md — Remote Job Aggregator

## Table Stakes (Must Have)
- Scrape multiple job boards in a single run
- Extract: title, company, apply link, location, experience, salary (if shown), posted date, tech stack
- Filter to remote-from-India + 0-2 years exp / fresher / internship
- Deduplicate by canonical URL or company+title hash
- Output markdown checklist `- [ ]` format for tracking
- Progress reporting every 25 jobs

## Differentiators (Nice to Have — In Scope)
- 🔥 HIGH MATCH flag for Rust/Solana/TypeScript/Next.js jobs
- Application tracker table at bottom (summary stats: total found, high match count, sources)
- Last 14 days filter based on posted date
- Per-source error logging (shows which sites failed/blocked)
- Phase progression: Tier 1 → Tier 2 → Tier 3

## Feature Complexity Notes
| Feature | Complexity | Notes |
|---------|-----------|-------|
| Static site scraping (Internshala, RemoteRocketship) | Low | `fetch + cheerio` |
| JS-rendered scraping (Wellfound, LinkedIn) | Medium | Requires Playwright or Camoufox |
| Solana Jobs (custom site) | Medium | URL-encoded JSON filter in query params |
| Pagination (max 10 pages/site) | Low | Loop with delay |
| Date filtering (14 days) | Medium | Parse relative dates ("2 days ago") and ISO dates |
| HIGH MATCH detection | Low | String matching on tech stack field |
| Deduplication | Low | Hash set |
| Markdown output | Low | Template string construction |

## Anti-Features (Explicitly Excluded)
- ❌ CAPTCHA bypass
- ❌ Login-gated content
- ❌ Auto-apply functionality
- ❌ Real-time monitoring / cron
- ❌ Storing PII beyond what's in the publicly visible job card

## Source-Specific Notes

### Tier 1 Sources
- **Internshala**: Mostly static, good Indian fresher jobs. Has "work from home" filter. Likely accessible via fetch+cheerio.
- **Wellfound**: React-heavy. May need Playwright. Has API-style endpoints inspectable via Network tab.
- **RemoteRocketship**: Static site with good structured data. fetch+cheerio should work.
- **Unstop**: React SPA. May need Playwright. Has internship filter.

### Tier 2 Sources
- **LinkedIn**: Heavily guarded. No login = limited results (usually 25/page). Best to try fetch+UA rotation.
- **Cutshort**: React app with filterable API. Try intercepting XHR calls.
- **Himalayas**: Static-ish. fetch+cheerio likely sufficient.

### Tier 3 Sources
- **jobs.solana.com**: Uses URL-encoded JSON filter. Direct fetch with proper URL should work.
- **cryptocurrencyjobs.co**: Relatively static. fetch+cheerio.
