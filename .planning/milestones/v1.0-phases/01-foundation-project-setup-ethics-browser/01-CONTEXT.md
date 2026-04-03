# Phase 1: Foundation — Project Setup, Ethics & Browser — Context

**Gathered:** 2026-04-03
**Status:** Ready for planning
**Mode:** Auto-selected (--auto flag)

<domain>
## Phase Boundary

Bootstrap the Bun+TypeScript project with all utilities, ethics infrastructure, and Camoufox/Playwright browser connection so subsequent phases can scrape without any setup friction.

Specifically: package.json, tsconfig.json, types.ts, utils.ts, browser.ts

Out of scope for this phase: actual scraping, filtering, output generation.
</domain>

<decisions>
## Implementation Decisions

### Project Structure
- **D-01:** Bun runtime (required by user rules) — `bun init`, NOT npm/node
- **D-02:** TypeScript strict mode enabled in tsconfig.json
- **D-03:** Source files in `src/` directory; output `job_opportunities.md` at project root
- **D-04:** Install dependencies: `playwright` (for Camoufox), `cheerio@1.x` (HTML parsing)

### Browser Connection Strategy
- **D-05:** [auto] Camoufox port detection — scan ports [9377, 3000, 9222, 8080] for a responding health/ping endpoint
- **D-06:** [auto] Use Playwright `firefox` browserType to connect (Juggler protocol, NOT Chrome CDP)
  - Connect via `playwright.firefox.connect(wsEndpoint)` or `playwright.firefox.launch()` fallback
  - The user's "CDP port 9377" actually refers to Camoufox's Playwright websocket endpoint
- **D-07:** [auto] Fallback chain: Camoufox detected → local Playwright Firefox launch → fetch-only mode
- **D-08:** [auto] Browser manager should be a class or module with `getPage()` method returning a Playwright page

### Utilities
- **D-09:** [auto] `delay(ms: number): Promise<void>` — simple sleep utility
- **D-10:** [auto] `retry(fn, maxAttempts=3, backoffMs=3000)` — exponential backoff (3s → 6s → 12s)
- **D-11:** [auto] `parseRelativeDate(str: string): Date` — handle: "X mins ago", "X hours ago", "X days ago", "X weeks ago", "yesterday", "today"
- **D-12:** [auto] `normalizeCompany(name: string): string` — lowercase, strip punctuation/Inc/Ltd, trim
- **D-13:** [auto] `checkRobotstxt(domain: string): Promise<boolean>` — fetch robots.txt, parse disallow rules, return true if /jobs path allowed (default allow if unavailable)
- **D-14:** [auto] UA rotation pool: 3-5 realistic Chrome/Firefox on Linux UAs

### Ethics
- **D-15:** [auto] 3-second fixed delay between requests (not random jitter) — simple and respects constraint
- **D-16:** [auto] CAPTCHA detection: check for HTTP 403, redirect to `/challenge`, `/verify` — log warning and skip page
- **D-17:** [auto] Robots.txt checked per domain on first request, result cached for session

### Agent's Discretion
- Error logging format: the agent decides (console.error with source + URL + reason)
- UA rotation frequency: the agent decides (once per scraper or per request)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Planning
- `.planning/PROJECT.md` — Project goals, constraints, core value
- `.planning/REQUIREMENTS.md` — All requirements for this phase: SETUP-01/02/03, BRWS-01/02/03/04, ETHI-01/02/03/04/06
- `.planning/research/STACK.md` — Technology choices and rationale
- `.planning/research/ARCHITECTURE.md` — Component structure and data flow
- `.planning/research/PITFALLS.md` — Key pitfalls for this phase: P1 (Camoufox≠CDP), P3 (relative dates), P8 (robots.txt)

### External Documentation
- Playwright Firefox docs: https://playwright.dev/docs/api/class-browsertype#browser-type-connect
- Camoufox: Firefox-based anti-detect browser using Juggler protocol, controlled via Playwright
- Bun docs: https://bun.sh/docs (for project setup)

</canonical_refs>

<deferred>
## Deferred Ideas

None — this is a greenfield project.
</deferred>
