---
phase: 07
slug: wellfound-unblocking
created: "2026-04-03"
milestone: v1.1
---

# Phase 07 — CONTEXT: Wellfound Unblocking

## Domain

Unblock the Wellfound scraper which is currently blocked by DataDome/Cloudflare CAPTCHA. The scraper already uses `fetchRendered()` (Camoufox → Playwright → fetch chain), but selectors may need refinement and the Camoufox path must be verified to actually return job data.

## Canonical Refs

- `.planning/REQUIREMENTS.md` — UBK1-01, UBK1-02, UBK1-03
- `src/scrapers/wellfound.ts` — current scraper implementation
- `src/browser.ts` — `fetchRendered()` with Camoufox → Playwright → fetch chain
- `.planning/phases/02-tier-1-scraping-data-processing-pipeline/02-SUMMARY.md` — notes Wellfound blocked by CF challenge

## Decisions

### Approach
- **Use Camoufox anti-detect browser** — the `fetchRendered()` chain already supports this. If Camoufox server is running on port 9377, it will be used automatically.
- **If Camoufox unavailable** — fall back to Playwright headless Firefox. If that also gets blocked, log warning and skip (graceful degradation).
- **No CAPTCHA solving** — ethical constraint. Only use legitimate anti-detect (browser fingerprint), no automated CAPTCHA bypass.

### Selector Strategy
- Wellfound is a React/Next.js SPA with dynamic class names
- Current scraper tries 4 selector strategies: `[data-test="JobListing"]`, `[class*="JobListing"]`, `._root`, `a[href*="/jobs/"]`
- Decision: Use the `fetchRendered()` path which waits for JS to mount, then parse the rendered DOM
- If selectors still return 0 results, try fetching the Wellfound API directly (if discoverable via network tab inspection)

### URL Strategy
- Current: 5 URLs covering entry-level full-time, internship, typescript, rust, solana filters
- Decision: Keep the same URL set. These are well-targeted for Pratham's profile.

### Verification
- Run scraper with Camoufox available → expect non-zero job count
- Run scraper without Camoufox → expect graceful skip with warning log
- Verify jobs flow through pipeline: location filter → experience filter → dedup → HIGH MATCH → output

### Testing
- Add integration test that runs `scrapeWellfound()` and verifies non-empty result (only when Camoufox available)
- Add unit test for selector parsing logic with mock HTML
- Update `src/browser.test.ts` to verify Camoufox path is taken when available

## Defer

- Wellfound pagination beyond first page — first get single page working
- Wellfound-specific experience/date extraction — use pipeline defaults for now

## Scope Creep Guard

This phase is **Wellfound unblocking only**. No changes to other scrapers, no new features.

---
*Context created: 2026-04-03*
