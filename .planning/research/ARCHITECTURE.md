# ARCHITECTURE.md — Remote Job Aggregator

## High-Level Components

```
scraper/
├── src/
│   ├── index.ts          # Entry point: orchestration, progress report, final output
│   ├── browser.ts        # Camoufox/Playwright connection manager (detect → connect → launch fallback)
│   ├── scrapers/
│   │   ├── internshala.ts
│   │   ├── wellfound.ts
│   │   ├── remoterocketship.ts
│   │   ├── unstop.ts
│   │   ├── linkedin.ts
│   │   ├── cutshort.ts
│   │   ├── himalayas.ts
│   │   ├── solana-jobs.ts
│   │   └── cryptocurrencyjobs.ts
│   ├── types.ts          # Job interface, ScrapeResult interface
│   ├── dedup.ts          # Hash-based deduplication
│   ├── filter.ts         # Date filter, experience filter, location filter
│   ├── formatter.ts      # Markdown output generation
│   └── utils.ts          # Delay, retry wrapper, robots.txt checker, UA rotation
├── package.json
├── tsconfig.json
└── job_opportunities.md  # Output file
```

## Data Flow

```
index.ts
  ├── detect/connect Camoufox browser (browser.ts)
  ├── for each scraper (Tier 1 → Tier 2 → Tier 3):
  │     ├── scraper.fetch(page) → RawJob[]
  │     ├── filter(jobs, {remote, fresher, last14days})
  │     ├── dedup(jobs, seenHashes)
  │     └── progress report every 25 jobs
  ├── sort(allJobs, recency + HIGH_MATCH first)
  └── formatter.write(allJobs) → job_opportunities.md
```

## Job Interface
```typescript
interface Job {
  title: string;
  company: string;
  applyUrl: string;
  location: string;
  experience: string;      // "0-1 yr", "Fresher", "Internship"
  salary?: string;         // Optional, often not shown
  postedDate: Date;
  techStack: string[];
  source: string;          // "Internshala", "Wellfound", etc.
  isHighMatch: boolean;    // true if Rust|Solana|TypeScript|Next.js found
}
```

## Browser Manager Flow
```
1. curl http://localhost:9377/health (Camoufox UDP probe)
2. If responds → connect via playwright.connect(wsEndpoint)
3. If fails → scan ports [3000, 9222, 8080] for /health
4. If all fail → launch Camoufox locally via playwright (fallback)
5. If playwright unavailable → use fetch-only mode
```

## Execution Model
- **Sequential per source** (not parallel) to respect 3s delay
- **Per-page delay**: 3s between pagination requests
- **Retry wrapper**: exponential backoff (3s → 6s → 12s), max 3 retries
- **Error isolation**: errors in one scraper don't stop others

## Build Order (Phase Dependencies)
1. `types.ts` → everything depends on Job interface
2. `utils.ts` → delay, retry (no deps)
3. `browser.ts` → Playwright connection (depends on utils)
4. `filter.ts` + `dedup.ts` → pure functions (no deps)
5. Each `scraper/*.ts` → depends on browser, utils, filter
6. `formatter.ts` → depends on types only
7. `index.ts` → orchestrates everything
