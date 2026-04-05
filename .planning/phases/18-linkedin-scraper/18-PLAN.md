# Phase 18: LinkedIn Scraper — PLAN

## Objective
Add LinkedIn jobs scraper with auth cookie support.

## Implementation

### Step 1: Rewrite `src/scrapers/linkedin.ts`
- Use Camoufox (port 9377) for rendering
- Navigate to LinkedIn Jobs search with filters (remote, entry level)
- Parse job cards: title, company, location, posted date, apply URL
- Handle infinite scroll with pagination limit
- Extract job description from click-to-expand
- Respect rate limits (3s between requests)

### Step 2: Add to pipeline
- Already wired in `index.ts` with cookie check
- Just needs the scraper implementation

## Verification
- `bun test` — scraper returns valid Job[] structure
- Manual test with real LinkedIn cookie

---
*Phase 18 plan: 2026-04-05*
