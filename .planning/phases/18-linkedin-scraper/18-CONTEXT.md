# Phase 18: LinkedIn Scraper — CONTEXT

## Objective
Add LinkedIn jobs as a scraping source using auth cookie for access.

## Requirements
- **LI-01**: Scrape LinkedIn Jobs with user-provided auth cookie
- **LI-02**: Parse job listings with title, company, location, skills, apply URL
- **LI-03**: Respect rate limits and robots.txt

## Architecture Notes
- LinkedIn scraper already exists at `src/scrapers/linkedin.ts` but requires `--linkedin-cookie`
- Current implementation is minimal — needs enhancement with proper selectors
- LinkedIn uses dynamic loading (infinite scroll) — need Camoufox/Playwright for rendering
- Cookie expires periodically — user needs to refresh manually
- Rate limit: ~100 requests/hour before temporary ban

## Dependencies
- Camoufox on port 9377 (already available)
- User must provide `--linkedin-cookie`

## Known Challenges
- LinkedIn aggressively detects automation
- Job descriptions behind click-to-expand
- "Easy Apply" vs "Apply externally" distinction
- Location parsing is inconsistent

## Files to Create/Modify
- `src/scrapers/linkedin.ts` — rewrite with proper selectors + pagination
- `src/cli.ts` — add `--linkedin-cookie` help text

---
*Created: 2026-04-05 for v3.0 Phase 18*
