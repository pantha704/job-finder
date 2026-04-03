---
wave: 1
depends_on: []
files_modified:
  - package.json
  - tsconfig.json
  - src/types.ts
  - src/utils.ts
  - src/index.ts
  - src/browser.ts
autonomous: true
---

# Plan: Foundation & Boilerplate

**Objective:** Bootstrap the Bun project, set up configuration, establish data models, implement all common utilities, and build the Browser connector so further phases can perform web scraping without boilerplate.

## Requirements

SETUP-01: Bun project initialized with TypeScript config
SETUP-02: Job interface defined
SETUP-03: Utility functions implemented
BRWS-01: Auto-detect Camoufox endpoint
BRWS-02: Connect to detected Camoufox endpoint via Playwright
BRWS-03: Fallback to headless Playwright browser launch
BRWS-04: Final fallback to fetch-only mode
ETHI-01: Check robots.txt before scraping
ETHI-02: Enforce 3-second minimum delay
ETHI-03: On CAPTCHA detection, skip
ETHI-04: Max 3 retries with exponential backoff
ETHI-06: User-Agent rotation

## Tasks

```xml
<task id="01-01">
  <title>Initialize Bun Project & TypeScript Config</title>
  <read_first>
    - package.json (to check if exists)
    - tsconfig.json
  </read_first>
  <action>
    Run `bun init -y` in the project root.
    Install playwright and cheerio: `bun add playwright cheerio@1.x`
    Install types: `bun add -d @types/bun`
    Modify `tsconfig.json` to ensure `"strict": true` is set in compilerOptions.
  </action>
  <acceptance_criteria>
    - `package.json` contains dependencies `playwright` and `cheerio`
    - `tsconfig.json` has `"strict": true`
  </acceptance_criteria>
</task>

<task id="01-02">
  <title>Define Types and Interfaces</title>
  <read_first>
    - src/types.ts (new)
    - .planning/phases/01-foundation-project-setup-ethics-browser/01-CONTEXT.md
  </read_first>
  <action>
    Create `src/types.ts` and define the following interfaces exactly:
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
  </action>
  <acceptance_criteria>
    - `bun --noEmit src/types.ts` exits 0 without syntax errors
    - `src/types.ts` contains `export interface Job`
  </acceptance_criteria>
</task>

<task id="01-03">
  <title>Implement Utility Functions (utils.ts)</title>
  <read_first>
    - src/utils.ts (new)
    - src/types.ts
    - .planning/phases/01-foundation-project-setup-ethics-browser/01-RESEARCH.md
  </read_first>
  <action>
    Create `src/utils.ts`. Implement the following functions using standard TypeScript (no external packages):

    1. `export const delay = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms));`
    2. `export async function retry<T>(fn: () => Promise<T>, maxAttempts: number = 3, backoffMs: number = 3000): Promise<T>` - Wrap `fn()` in a try-catch, if fails, wait `backoffMs` times attempt count, up to `maxAttempts`. Throws an error on max attempts. Skip retry if error message includes "captcha".
    3. `export function parseRelativeDate(str: string): Date` - Match strings containing "ago", "today", "yesterday", extract digit, subtract relative ms from `new Date()`. Default to `new Date()` if parsing fails.
    4. `export function normalizeCompany(name: string): string` - `return name.toLowerCase().replace(/inc\.?|ltd\.?|llc\.?|[^a-z0-9]/g, '').trim();`
    5. `export async function checkRobotstxt(domain: string): Promise<boolean>` - Fetch `https://${domain}/robots.txt`. If fetch fails, return true. If fetched, parse lines checking for `Disallow: /`. Hardcode specific paths if necessary, but returning true is fine for now on error.
    6. `export function getRandomUserAgent(): string` - Provide an array of 5 modern Chrome/Firefox Linux UAs and return one randomly.
  </action>
  <acceptance_criteria>
    - `src/utils.ts` contains `export const delay`
    - `src/utils.ts` contains `export async function retry`
    - `bun --noEmit src/utils.ts` exits 0
  </acceptance_criteria>
</task>

<task id="01-04">
  <title>Implement Browser Connector (browser.ts)</title>
  <read_first>
    - src/browser.ts (new)
    - src/types.ts
    - src/utils.ts
    - .planning/phases/01-foundation-project-setup-ethics-browser/01-RESEARCH.md
  </read_first>
  <action>
    Create `src/browser.ts`.
    Import `{ firefox, Browser }` from 'playwright'.
    Write `async function detectCamoufoxPort(): Promise<number | null>`: Use fetch to loop through `[9377, 3000, 9222, 8080]`, requesting `http://127.0.0.1:${port}/json`. Return the first port that responds with ok, else null.
    Write `export async function getBrowser(): Promise<Browser | 'fetch-only'>`:
    - Let port = await detectCamoufoxPort().
    - If port exists, try `firefox.connect({ wsEndpoint: "ws://127.0.0.1:" + port })`. On success, console log "Camoufox detected at port " + port, and return browser.
    - If port doesn't exist or connect fails, try `firefox.launch({ headless: true })`.
    - If launch fails, console block: "Using fetch-only mode", and return `'fetch-only'`.
  </action>
  <acceptance_criteria>
    - `src/browser.ts` contains `export async function getBrowser`
    - `src/browser.ts` calls `firefox.connect` inside `getBrowser`
    - `bun --noEmit src/browser.ts` exits 0
  </acceptance_criteria>
</task>

<task id="01-05">
  <title>Create Entrypoint Index</title>
  <read_first>
    - src/index.ts (new)
    - src/browser.ts
  </read_first>
  <action>
    Create `src/index.ts`.
    Write a main async function that calls `getBrowser()` from `browser.ts`, logs the result.
    Provide a dummy try-catch over `delay(100)` to show utils work, then `process.exit(0)`.
  </action>
  <acceptance_criteria>
    - `src/index.ts` contains `getBrowser()`
    - `bun run src/index.ts` executes without syntax errors
  </acceptance_criteria>
</task>
```

## Verification
- Run `bun --noEmit src/index.ts` and confirm it is type safe.
- Run `bun run src/index.ts` and observe it attempts to connect/launch.

## Must Haves
- [ ] TypeScript strict mode configured
- [ ] Browser module correctly exports abstract `getBrowser()`
- [ ] Retry utility uses exponential backoff logic and skips captchas
- [ ] Job interface covers all fields
