# SUMMARY.md — Research Synthesis

## TL;DR

Build a Bun+TypeScript scraper with Playwright-connected Camoufox for JS-heavy sites and native `fetch+cheerio` for static sites. Sequential execution with 3s delays, hash-based deduplication, date-filtered to last 14 days.

---

## Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Runtime | Bun | User requirement; native fetch, fast TS |
| HTTP | `fetch` (Bun native) | Static sites |
| HTML parsing | `cheerio@1.x` | jQuery-like, fast |
| Browser | Playwright + Camoufox | JS-rendered sites (Wellfound, Unstop, etc.) |
| Dedup | SHA-256 hash | Simple, fast, reliable |

## Table Stakes Features
- Multi-source scraping (9 sources across 3 tiers)
- Job extraction: title, company, link, exp, salary, date, tech stack
- Filters: remote, India, fresher/0-2yr, last 14 days
- Deduplication by `normalize(company)+normalize(title)` hash
- Markdown `- [ ]` output with 🔥 HIGH MATCH flagging
- Progress reporting every 25 jobs

## Watch Out For

1. **Camoufox ≠ Chrome CDP** — uses Firefox Juggler via Playwright, not CDP
2. **LinkedIn blocks unauthenticated** — expect limited/no results; skip gracefully
3. **Relative dates vary per site** — need robust `parseRelativeDate()` utility
4. **50-80% duplication rate** across sources — dedup hash must normalize company names
5. **JS-heavy sites silently empty** — must route through Playwright for Wellfound/Unstop

## Architecture Pattern

```
index.ts → [browser.ts] → scrapers (per-site) → filter → dedup → sort → formatter → job_opportunities.md
```

Sequential per-source execution, isolated error handling, progress reporting, atomic output.

## Phase Build Order Recommendation

1. Project setup + types + utils (delay, retry, robots.txt check)
2. fetch+cheerio scrapers (Tier 1 static: Internshala, RemoteRocketship)
3. Browser connection (Camoufox detection + Playwright)
4. Playwright scrapers (Wellfound, Unstop, Cutshort)
5. Tier 2+3 scrapers (LinkedIn, Himalayas, Solana Jobs, CryptoJobsList)
6. Filter + dedup + formatter + output
