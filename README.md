# 🎯 Remote Job Aggregator for Fresher Developers

An automated, ethical web scraper that collects **200+ remote, entry-level and internship job listings** from multiple job boards and outputs a curated, de-duplicated markdown checklist (`job_opportunities.md`) with application tracking.

> **Built for:** Pratham Jaiswal — 3rd-year BTech, Kolkata 🇮🇳
> **Focus:** Rust · TypeScript · Next.js · Solana · Web3
> **Filter:** Remote from India · 0–2 YOE · Fresher/Internship

---

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Install Playwright browser (one-time)
bunx playwright install firefox

# Run the full scrape
bun run src/index.ts

# Output is written to:
# → job_opportunities.md
```

---

## 📊 What You Get

`job_opportunities.md` is structured in three sections:

```markdown
## 🔥 High Match Jobs (22)
# → Rust / Solana / TypeScript / Web3 roles, sorted by match score

## 📋 All Remote Fresher Jobs (237)
# → All filtered, deduplicated remote/WFH positions

## 📊 Application Tracker
# → Source breakdown table + applied count tracking
```

Each entry looks like:
```markdown
- [ ] **Full-Stack Engineer** @ **Razorpay** [🔥 HIGH MATCH (score: 2)] `TypeScript · Next.js`
  - 🔗 [Apply](https://internshala.com/...) · Source: Internshala
```

Check the box `[x]` when you apply to track progress.

---

## 🏗️ Architecture

```
src/
├── index.ts          ← Main pipeline orchestrator
├── types.ts          ← Job interface definition
├── filter.ts         ← Fresher detection, HIGH MATCH scoring, location check
├── dedup.ts          ← SHA-based deduplication + URL validation
├── formatter.ts      ← Markdown output formatter
├── browser.ts        ← Playwright browser factory (Camoufox → headless Firefox → fetch-only)
├── utils.ts          ← retry(), delay(), checkRobotstxt(), getRandomUserAgent()
└── scrapers/
    ├── internshala.ts        ← Tier 1: fetch + cheerio
    ├── remoterocketship.ts   ← Tier 1: fetch + cheerio
    ├── unstop.ts             ← Tier 1: Playwright stub
    ├── wellfound.ts          ← Tier 2: Playwright (JS-rendered)
    ├── cutshort.ts           ← Tier 2: fetch + cheerio
    ├── himalayas.ts          ← Tier 2: Playwright (JS-rendered)
    ├── solanajobs.ts         ← Tier 3: JSON API + HTML fallback
    ├── cryptocurrencyjobs.ts ← Tier 3: fetch + cheerio
    ├── remoteok.ts           ← Tier 4: JSON API
    ├── remotive.ts           ← Tier 4: fetch + cheerio
    ├── weworkremotely.ts     ← Tier 4: fetch + cheerio
    ├── jobicy.ts             ← Tier 4: fetch + cheerio
    └── jobspresso.ts         ← Tier 4: fetch + cheerio
```

### Pipeline Flow

```
┌─────────────┐    raw jobs     ┌──────────────┐   filtered    ┌────────────┐
│  Scrapers   │ ─────────────▶  │   Filter     │ ────────────▶ │   Dedup    │
│ (14 sources)│                 │  isFresher() │               │ Company +  │
└─────────────┘                 │ checkLoc()   │               │ Title +    │
                                │ getMatch()   │               │ Hostname   │
                                └──────────────┘               └─────┬──────┘
                                                                      │
                                                              unique jobs
                                                                      │
                                                               ┌──────▼──────┐
                                                               │  Formatter  │
                                                               │  Sorted by  │
                                                               │  matchScore │
                                                               └──────┬──────┘
                                                                      │
                                                          job_opportunities.md
```

---

## 🔍 The 3-Stage Filter

### Stage 1 — `isFresher(experience)` in `src/filter.ts`

Decides if an experience string is fresher-eligible:

| Input | Result | Reason |
|-------|--------|--------|
| `"Fresher/Internship"` | ✅ `true` | exact keyword |
| `"0-1 years"` | ✅ `true` | max years ≤ 2 |
| `"6 months"` | ✅ `true` | month-based |
| `"3-5 years"` | ❌ `false` | max years > 2 → dropped |
| `"Senior Developer"` | ⚠️ `'verify'` | ambiguous → kept with flag |
| `""` (empty) | ⚠️ `'verify'` | unknown → kept with flag |

### Stage 2 — `checkLocation(location)` in `src/filter.ts`

| Input | Result | Reason |
|-------|--------|--------|
| `"Remote"` | ✅ `true` | explicit allowlist |
| `"India"` / `"WFH"` | ✅ `true` | allowlist match |
| `"Worldwide"` / `"Global"` | ✅ `true` | allowlist match |
| `"US Only"` / `"UK Only"` | ❌ `false` | blocklist → dropped |
| `"Mumbai"` / `"London"` | ⚠️ `'verify'` | city, unknown if WFH |

> **Philosophy:** It's better to show 10 extra jobs to manually review than silently drop a good one.

### Stage 3 — `generateDedupKey()` in `src/dedup.ts`

```ts
// Key = company + title + domain (hostname only)
// Example:
"razorpay-react developer intern-internshala.com"

// Same job scraped from 3 different category pages → 1 entry kept
// Best data wins: higher matchScore → or → more recent postedDate
```

### HIGH MATCH Scoring — `getMatchScore()` in `src/filter.ts`

Matches these keywords using **word boundaries** (regex `\b`) to prevent false positives:

```
\bRust\b     ← won't match "Trust" or "Rustic"
\bSolana\b   ← won't match "Solana Beach" (location)
\bNext\.?js\b
\bTypeScript\b
\bWeb3\b
\bAnchor\b
\bWASM\b
```

Score ≥ 1 → 🔥 **HIGH MATCH**. Score 2+ floats the job to the very top.

---

## 🌐 Scraping Strategy Reference

| Site Type | Strategy | When to Use |
|-----------|----------|-------------|
| Static HTML | `fetch` + `cheerio` | Most job boards — fastest and most ethical |
| JSON API | `fetch` → `res.json()` | RemoteOK, RSS-style feeds |
| JS-Rendered / Cloudflare | `fetchRendered()` | Wellfound, Himalayas — automatic 3-tier fallback |
| robots.txt blocked | Skip | LinkedIn (non-negotiable ethical rule) |

### 🔁 Browser Fallback Chain (`src/browser.ts`)

For JS-rendered sites, `fetchRendered(url)` automatically tries 3 methods in order:

```
Tier 1: Camoufox REST API (port 9377)       ← Anti-detect Firefox, bypasses Cloudflare
         ↓ if not running
Tier 2: Playwright headless Firefox          ← Standard automation, works for most SPAs
         ↓ if Playwright not installed
Tier 3: Plain fetch with browser-like headers ← Always available, fails on Cloudflare
```

The method used is logged for every request:
```
[Wellfound] using camoufox for remote=true&skills=typescript
[Himalayas] using fetch for skill=rust
```

### 🦊 Using Camoufox (Recommended for Wellfound)

Camoufox is an anti-detect Firefox-based browser that bypasses Cloudflare challenges.
The scraper connects to it via its REST API — **you don't need to change any code**,
just have the server running.

**To start Camoufox server:**
```bash
# If you have the camoufox server repo cloned:
cd /path/to/camoufox-server && node server.js
# → Listens on http://localhost:9377

# The scraper auto-detects it via /health endpoint
# Status: ✓ Camoufox detected on port 9377
```

**Without Camoufox:**
```
ℹ Camoufox not available (port 9377) — will use fetch fallback
```
Wellfound will likely return a Cloudflare challenge in this case. All other sites work fine without it.

### Ethics Rules (Non-Negotiable)

- ✅ 3-second delay between every request (`delay(3000)`)
- ✅ Check `robots.txt` before scraping (`checkRobotstxt(domain, path)`)
- ✅ Max 3 retries per URL with exponential backoff
- ✅ Max 10 pages per site
- ❌ No CAPTCHA bypass
- ❌ No fake credential injection

---

## ➕ How to Add a New Scraper

### Step 1 — Create `src/scrapers/yoursite.ts`

Use this template for **fetch + cheerio** (preferred):

```ts
import * as cheerio from 'cheerio';
import type { Job } from '../types';
import { delay, retry, checkRobotstxt, getRandomUserAgent } from '../utils';

export async function scrapeYourSite(): Promise<Job[]> {
  const jobs: Job[] = [];

  // ALWAYS check robots.txt first — pass the path you'll be scraping
  const allowed = await checkRobotstxt('yoursite.com', '/jobs');
  if (!allowed) { console.warn('[YourSite] robots.txt blocked'); return jobs; }

  const urls = [
    'https://yoursite.com/jobs?remote=true&level=entry',
    'https://yoursite.com/jobs?skill=typescript',
  ];

  for (const url of urls) {
    try {
      const html = await retry(async () => {
        const res = await fetch(url, {
          headers: {
            'User-Agent': getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml',
          }
        });
        if (res.status === 429) throw new Error('captcha rate limit 429');
        if (res.status === 403) throw new Error('captcha blocked 403');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      });

      const $ = cheerio.load(html);
      let count = 0;

      // Your selectors here — inspect the site to find the right ones
      $('a[href*="/jobs/"]').closest('article, li, .job-card').each((_, el) => {
        const $el = $(el);
        const title = $el.find('h2, h3, [class*="title"]').first().text().trim();
        const company = $el.find('[class*="company"]').first().text().trim();
        const location = $el.find('[class*="location"]').first().text().trim() || 'Remote';
        const link = $el.find('a[href*="/jobs/"]').first().attr('href') || '';
        const applyUrl = link.startsWith('http') ? link : `https://yoursite.com${link}`;

        if (title && link) {
          jobs.push({
            title,
            company: company || 'Unknown',
            applyUrl,
            location,
            experience: 'Entry Level',     // or parse from page
            salary: null,                  // or parse
            postedDate: null,              // or parse as new Date(...)
            techStack: [],                 // or parse tags
            source: 'YourSite',
            isHighMatch: false,            // pipeline sets this automatically
          });
          count++;
        }
      });

      console.log(`[YourSite] +${count} (total: ${jobs.length})`);
      await delay(3000); // MANDATORY — ethical scraping
    } catch (err: any) {
      if (err.message.includes('captcha') || err.message.includes('rate limit')) {
        console.warn('[YourSite] Blocked — skipping');
        break;
      }
      console.warn(`[YourSite] Error: ${err.message}`);
    }
  }

  return jobs;
}
```

For **Playwright (JS-rendered sites)**, see `src/scrapers/wellfound.ts` as a reference.

### Step 2 — Register in `src/index.ts`

```ts
// At the top with other imports:
import { scrapeYourSite } from "./scrapers/yoursite";

// In the SOURCES array:
const SOURCES = [
  // ... existing sources ...
  { name: "YourSite", fn: scrapeYourSite, tier: 2 },  // pick tier 1-4
];
```

### Step 3 — Add to trusted hostnames in `src/dedup.ts`

```ts
const TRUSTED_HOSTNAMES = new Set([
  // ... existing ...
  "yoursite.com",   // ← add this so HEAD validation is skipped
]);
```

That's it — re-run `bun run src/index.ts` and your new source will be included.

---

## 🤖 Agent Prompt — Generate a Scraper for Any Site

If you want an AI agent to write a new scraper for you, paste this prompt:

---

```
You are adding a new scraper to the Remote Job Aggregator project.
The project is located at: ~/Documents/jobs/

Read these files first to understand conventions:
- src/types.ts           ← Job interface you must satisfy
- src/utils.ts           ← retry(), delay(), checkRobotstxt(), getRandomUserAgent()
- src/browser.ts         ← getBrowser() for Playwright-based scrapers
- src/scrapers/internshala.ts    ← reference: fetch + cheerio pattern
- src/scrapers/wellfound.ts      ← reference: Playwright pattern
- src/scrapers/solanajobs.ts     ← reference: JSON API + HTML fallback pattern
- src/dedup.ts           ← TRUSTED_HOSTNAMES set you need to update

Target site: [INSERT SITE URL HERE]

Instructions:
1. Check robots.txt at [SITE]/robots.txt — if scrapers are blocked, say so and stop.
2. Inspect the job listing page HTML or API (use fetch to get it).
3. Determine: is it static HTML, a JSON API, or JS-rendered?
   - Static → use fetch + cheerio (preferred)
   - JSON API → use fetch + res.json()
   - JS-rendered → use getBrowser() + Playwright page.evaluate()
4. Write src/scrapers/[sitename].ts exporting `async function scrape[SiteName](): Promise<Job[]>`
5. Use retry() for all fetch calls. Add delay(3000) after each URL.
6. Scrape these URL patterns if they exist:
   - Remote + entry level / fresher / internship filter
   - Skill filters: typescript, rust, solana, web3, next.js
   - Max 10 pages per URL
7. Map fields to the Job interface exactly (see types.ts). Set isHighMatch: false — the pipeline sets it.
8. Add "[SiteName]" to TRUSTED_HOSTNAMES in src/dedup.ts
9. Add the import + source entry to src/index.ts SOURCES array
10. Show me the final diff of all 3 files changed.

Ethics constraints (enforce strictly):
- checkRobotstxt() before any request
- 3s delay between every request
- Max 3 retries
- No CAPTCHA bypass
- Gracefully skip on 429/403
```

---

---

## 🧱 Job Interface Reference

```ts
// src/types.ts
interface Job {
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

  // Set by pipeline (don't set in scraper):
  matchScore?: number;
  isFresher?: boolean | 'verify';
  isRemoteIndia?: boolean | 'verify';
}
```

---

## 📈 Source Status

| Source | Tier | Method | Status |
|--------|------|--------|--------|
| Internshala | 1 | fetch + cheerio | ✅ Working (173 jobs) |
| RemoteRocketship | 1 | fetch + cheerio | ✅ Partial (403 on some pages) |
| Unstop | 1 | Playwright | 🚧 Stub — needs implementation |
| Wellfound | 2 | Playwright | ✅ Fixed (JS-rendered) |
| Cutshort | 2 | fetch + cheerio | ✅ Working (20 jobs) |
| Himalayas | 2 | Playwright | ✅ Fixed (JS-rendered) |
| SolanaJobs | 3 | HTML scrape | ✅ Working (19 jobs) |
| CryptocurrencyJobs | 3 | fetch + cheerio | ⚠️ 0 results (selectors need update) |
| RemoteOK | 4 | JSON API | ✅ Working (43 jobs) |
| Remotive | 4 | fetch + cheerio | ❌ 403 blocked |
| WeWorkRemotely | 4 | fetch + cheerio | ❌ 403 blocked |
| Jobicy | 4 | fetch + cheerio | ❌ 403 blocked |
| Jobspresso | 4 | fetch + cheerio | ⚠️ 0 results |
| LinkedIn | 2 | - | ❌ robots.txt blocked |

## 📝 Notes

- Run from the `jobs/` directory (`bun run src/index.ts`)
- The scrape takes ~10–15 minutes for all sources (3s delay per request × many pages)
- Output is saved incrementally every 25 jobs — safe to Ctrl+C and resume manually
- `job_opportunities.md` is fully overwritten on each run (not appended)
