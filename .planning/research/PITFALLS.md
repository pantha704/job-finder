# PITFALLS.md — Remote Job Aggregator

## P1: Camoufox ≠ Chrome CDP
**Warning Sign:** Port 9377 doesn't respond to Chrome CDP `JSON/version` endpoint  
**Root Cause:** Camoufox uses Firefox's Juggler protocol, not CDP  
**Prevention:** Use `playwright.connect({ wsEndpoint })` not CDP-style connection. Check for `/json/version` vs Firefox's `browser.newPage()` Playwright API.  
**Phase:** Phase 1 (Browser Setup)

## P2: LinkedIn Rate Limiting (429 Without Login)
**Warning Sign:** Scraper returns 0 jobs or HTML with "Sign in to see more jobs"  
**Root Cause:** LinkedIn heavily restricts unauthenticated crawls — typically shows only 25 jobs without login, then blocks  
**Prevention:** Try fetch with realistic User-Agent. If blocked after 1 page, treat as CAPTCHA case: log warning, skip, don't retry.  
**Phase:** Phase 2 (Tier 2 scraping)

## P3: Relative Date Parsing Breaks Recency Filter
**Warning Sign:** All jobs pass through or none pass the last-14-days filter  
**Root Cause:** Sites use "2 days ago", "3 hours ago", "Last week", "Just now" — different per site  
**Prevention:** Build a `parseRelativeDate(str: string): Date` utility. Handle: "X minutes ago", "X hours ago", "X days ago", "X weeks ago". Log unparsed dates.  
**Phase:** Phase 1 (filter.ts)

## P4: High Duplication Rates (50-80%) Across Sources
**Warning Sign:** count before dedup >> count after dedup  
**Root Cause:** Same job posted on Internshala, LinkedIn, and Cutshort simultaneously  
**Prevention:** Hash on `normalize(company) + normalize(title)` (lowercase, strip special chars) — NOT just URL (URLs differ per source). Log dedup count.  
**Phase:** All phases (dedup.ts)

## P5: JS-Rendered Content Returns Empty on Static Fetch
**Warning Sign:** `cheerio` parses HTML but job containers are empty  
**Root Cause:** Wellfound, Unstop, Cutshort render via React/JavaScript  
**Prevention:** Route these sites through Camoufox/Playwright path. Use `page.waitForSelector('.job-card', {timeout: 10000})` before extracting.  
**Phase:** Phase 1 + Phase 2

## P6: Solana Jobs URL Encoding
**Warning Sign:** Solana jobs URL returns all jobs, not filtered entry-level  
**Root Cause:** Filter is base64-encoded JSON in query params — needs to be constructed correctly  
**Prevention:** Decode the URL from the spec, verify the filter matches `{seniority: ["entry_level", "internship"]}` exactly.  
**Phase:** Phase 3

## P7: Progress Count vs. Deduped Count Confusion
**Warning Sign:** Progress says "200 jobs found" but output only has 80  
**Root Cause:** Reporting extracted count vs. unique-after-filter count  
**Prevention:** Track and report both: `scraped: N, filtered: M, unique: K` per source. Final count is post-dedup.  
**Phase:** All phases (index.ts)

## P8: robots.txt Missing or Inaccessible
**Warning Sign:** robots.txt fetch times out or returns 404  
**Prevention:** If robots.txt is inaccessible, assume conservative policy (allow scraping with delays). Never assume permission; log "robots.txt unavailable, proceeding with caution".  
**Phase:** Phase 1 (utils.ts)
