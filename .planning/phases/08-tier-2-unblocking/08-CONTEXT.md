---
phase: 08
slug: tier-2-unblocking
created: "2026-04-03"
milestone: v1.1
---

# Phase 08 — CONTEXT: Tier 2 Unblocking (LinkedIn, Cutshort, Himalayas)

## Domain

Unblock LinkedIn (429 rate-limited), Cutshort (403 on plain fetch), and Himalayas (React SPA = 0 results via cheerio). These 3 sources were working in v1.0 but returned unreliable data.

## Canonical Refs

- `.planning/REQUIREMENTS.md` — UBK2-01, UBK2-02, UBK2-03, UBK2-04
- `src/scrapers/linkedin.ts` — guest API with 429 handling
- `src/scrapers/cutshort.ts` — plain fetch with 403 blocking
- `src/scrapers/himalayas.ts` — React SPA using fetchRendered
- `src/browser.ts` — `fetchRendered()` with Camoufox → Playwright → fetch

## Decisions

### LinkedIn (UBK2-01, UBK2-02)
- **Current approach:** Guest API (`/jobs-guest/jobs/api/seeMoreJobPostings/search`) — no auth
- **Problem:** Rate-limited (429) with no recovery
- **Decision:** Guest API is the only ethical approach (no login scraping). Add longer delay (5s) between LinkedIn requests and reduce URL count. Accept that LinkedIn may return 0 jobs on rate-limited runs — this is expected behavior.
- **Auth cookie approach (UBK2-01):** Skip — adding auth cookie injection to `PipelineOptions.linkedin.cookie` violates the "no login-gated content" out-of-scope constraint. Mark UBK2-01 as out of scope.
- **Production verification (UBK2-02):** Test with current guest API. If 429, document as rate-limit limitation.

### Cutshort (UBK2-04)
- **Current approach:** Plain fetch with cheerio
- **Problem:** 403 anti-bot
- **Decision:** Switch to `fetchRendered()` (Camoufox → Playwright → fetch). Cutshort is a React app that likely renders content server-side or via JS. Playwright should bypass the 403.
- **Verification:** Test with Camoufox running.

### Himalayas (UBK2-03)
- **Current approach:** `fetchRendered()` — already uses Playwright fallback
- **Problem:** Returns 0 results (selectors may not match rendered DOM)
- **Decision:** Himalayas may have server-side rendering. Check if plain fetch returns SSR HTML with job cards. If not, inspect rendered DOM via Playwright to find correct selectors.
- **Verification:** Log HTML content length to diagnose whether page loads.

## Defer
- LinkedIn pagination beyond first page
- Cutshort-specific job detail extraction beyond basic cards

## Scope Creep Guard
This phase is **Tier 2 unblocking only**. No changes to Tier 1/3 scrapers, no new features.

---
*Context created: 2026-04-03*
