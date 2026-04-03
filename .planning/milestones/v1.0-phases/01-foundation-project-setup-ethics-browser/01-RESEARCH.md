# Phase 1 Research: Foundation — Project Setup, Ethics & Browser

## Environment Status
- **Bun Version:** 1.3.9
- **Project state:** Fresh initialization, no `package.json` or code yet.
- **Dependencies required:** `playwright`, `cheerio` (v1.x)
- **Tools:** Use `bun init` for boilerplate, but we need to create `package.json` and configure `tsconfig.json` for strict mode.

## Camoufox Connection Strategy
Camoufox is an anti-detect browser based on Firefox. It uses the Juggler protocol that Playwright supports for Firefox.
**Crucial Context:** Do not use Chromium CDP commands or `playwright.chromium`.
**Connection string:** `ws://127.0.0.1:<port>`
**API:**
```typescript
import { firefox } from 'playwright';

// Connecting to existing Camoufox instance
const browser = await firefox.connect({ wsEndpoint: `ws://127.0.0.1:${port}` });
```

## Types.ts Design
We need core data models to build the app cleanly.
```typescript
export interface Job {
  title: string;
  company: string;
  applyUrl: string;
  location: string;
  experience: string;
  salary: string | null;
  postedDate: Date | null;
  techStack: string[];
  source: string;
  isHighMatch: boolean;
}

export interface ScrapeResult {
  source: string;
  jobs: Job[];
  errors: ErrorLog[];
}

export interface ErrorLog {
  url: string;
  reason: string;
  timestamp: Date;
}
```

## Utils.ts Design
Utility functions mapped to the requirements:
- `delay(ms: number)`: Simple `await new Promise(r => setTimeout(r, ms))`.
- `retry<T>(fn: () => Promise<T>, maxAttempts = 3, backoffMs = 3000)`: Exponential backoff wrapper.
- `parseRelativeDate(str: string)`: Matches patterns like "2 days ago", "3h", "today", "yesterday" using regex and subtracts milliseconds from Date.now().
- `normalizeCompany(name: string)`: Lowercase, strip punctuation/Ltd/Inc wrapper, trim.
- `checkRobotstxt(domain: string)`: Fetch `https://${domain}/robots.txt`. Returns true if allowed, false if blocked. Defaults to true on error.
- `getRandomUserAgent()`: Rotate through an array of modern Chrome/Firefox Linux UAs.

## Browser.ts Design
Responsible for giving the scraper a usable browser page.
- **Port Detection Algorithm:** Iterate through `[9377, 3000, 9222, 8080]`. Try to hit `http://127.0.0.1:${port}/json` or `/health` using `fetch`. If successful, use that port.
- **Fallback Chain:** 
  1. Found Camoufox Port -> `firefox.connect(wsEndpoint)`
  2. Not found -> `firefox.launch({ headless: true })`
  3. No Playwright -> Throw exception indicating fallback to custom `fetch` mode.

## Ethics Infrastructure
- **Minimum delay (ETHI-02):** Explicit 3-second delay enforced manually via `await delay(3000)` after a successful document load.
- **Robots.txt caching (ETHI-01):** We will cache responses from domains to `checkRobotstxt` so we do not spam it.
- **CAPTCHA detection (ETHI-03):** Intercept standard 403 responses or redirects to paths containing `/challenge`, `/verify`, `/captcha`. Should throw a specific error type `CaptchaError` caught by the retry wrapper.

## Validation Architecture
- **SETUP-01 to SETUP-03**: Verify `bun run src/index.ts` succeeds.
- **BRWS-01 to BRWS-04**: Execute a dummy run of `browser.ts` looking for the exact console log "Camoufox detected at port X" or "Using fetch-only mode", verifiable via regex.
- **ETHI-01**: Fetch mock or real domains yielding correct allow/deny booleans.
- **Dates & Delays**: Assertions in test functions measuring the difference using `performance.now()`.

## Implementation Order
1. `bun init` & package installation (`package.json`, `tsconfig.json`).
2. `src/types.ts`
3. `src/utils.ts` (requires types and no external dependencies)
4. `src/browser.ts` (requires playwright)
5. `src/index.ts` containing the simple executable entry point demonstrating the setup.

## RESEARCH COMPLETE
Phase 1 research written to .planning/phases/01-foundation-project-setup-ethics-browser/01-RESEARCH.md
