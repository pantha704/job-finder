---
phase: "03"
name: "Tier 2 Scraping (LinkedIn, Cutshort, Himalayas)"
status: complete
completed_at: 2026-04-03
one_liner: "All 3 Tier 2 scrapers implemented — Himalayas JSON API, Cutshort fetch, LinkedIn guest API"
---

# Phase 03 Summary: Tier 2 Scraping

## What Was Built

### himalayas.ts
- `fetchRendered` (Playwright → plain fetch fallback) for React SPA
- 6 URL variants by skill/experience level
- Extracts title, company, apply URL, salary range

### cutshort.ts
- `fetch` + cheerio parser
- 6 search URLs across tech (TS, React, Node, Rust, Solana)
- Respects robots.txt, 3s delay between requests

### linkedin.ts
- LinkedIn guest jobs API (`/jobs-guest/jobs/api/seeMoreJobPostings/search`)
- No auth required — uses public job card endpoint
- Graceful skip on 403/block, 3 retries

## Notes

LinkedIn guest API is rate-limited and may return 429 — handled via retry with backoff.
Cutshort blocks direct fetch — `fetchRendered` fallback recommended for production runs.
Himalayas is a React SPA — requires `fetchRendered` for reliable extraction.
