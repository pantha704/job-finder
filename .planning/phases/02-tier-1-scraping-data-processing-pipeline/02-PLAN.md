---
wave: 1
depends_on: []
files_modified:
  - src/filter.ts
  - src/dedup.ts
  - src/formatter.ts
  - src/types.ts
  - src/scrapers/internshala.ts
  - src/scrapers/wellfound.ts
  - src/scrapers/unstop.ts
  - src/scrapers/remoterocketship.ts
  - src/index.ts
  - package.json
autonomous: true
---

# Plan: Tier 1 Scraping + Data Processing Pipeline

**Objective:** Scrape 4 Tier 1 sources and build the core data pipeline (filter, dedup, HIGH MATCH flag, partial persistence, UI reporting) per user decisions.

## Tasks

```xml
<task id="02-01">
  <title>Install Ora & Extend Types</title>
  <read_first>
    - package.json
    - src/types.ts
  </read_first>
  <action>
    Install `ora` for CLI spinners: `bun add ora` and potentially typed for typescript.
    Update `src/types.ts` to include:
    - `matchScore: number` (0-3+)
    - `isRemoteIndia: boolean | 'verify'`
    - `isFresher: boolean | 'verify'`
  </action>
  <acceptance_criteria>
    - `ora` is in package.json
    - `src/types.ts` has the new fields on the Job interface
  </acceptance_criteria>
</task>

<task id="02-02">
  <title>Implement Filtering Logic (filter.ts)</title>
  <read_first>
    - src/filter.ts
    - .planning/phases/02-tier-1-scraping-data-processing-pipeline/02-CONTEXT.md
  </read_first>
  <action>
    Implement in `src/filter.ts`:
    - `isFresher(exp: string): boolean | 'verify'`: Explicit parsing -> fuzzy match ("fresher", "entry", "0-1 year", "new grad", "intern") -> return 'verify' if unclear.
    - `getMatchScore(text: string): { score: number, isHighMatch: boolean }`: Regex boundaries `/\bRust\b/i`, `/\bSolana\b/i`, `/\bTypeScript\b/i`, `/\bNext\.?js\b/i`, `/\bWeb3\b/i`, `/\bAnchor\b/i`, `/\bWASM\b/i`.
    - `checkLocation(loc: string): boolean | 'verify'`: Check positive signals ("Remote (India)", "WFH - India", "APAC", "Global") vs negative ("US only", "EU timezone", "Must be in California"). Keep 'verify' on ambiguity.
  </action>
  <acceptance_criteria>
    - `src/filter.ts` properly implements string parsing avoiding false positives like "Trust" -> "Rust".
  </acceptance_criteria>
</task>

<task id="02-03">
  <title>Implement Deduplication & URL Pre-Flight Validation</title>
  <read_first>
    - src/dedup.ts
    - src/utils.ts
    - .planning/phases/02-tier-1-scraping-data-processing-pipeline/02-CONTEXT.md
  </read_first>
  <action>
    Create `src/dedup.ts`:
    - `generateDedupKey(company, title, applyLink): string` to produce `${company.toLowerCase()}-${title.toLowerCase()}-${hostname}`
    - `mergeJobs(jobA, jobB): Job` keeping most complete data > most recent date > direct link.
    
    In `src/utils.ts` or `src/filter.ts`:
    - Add `validateUrl(url: string, timeoutMs: number = 5000): Promise<boolean>` using `fetch` with `method: "HEAD"`. Return false on 404/403 or timeout.
  </action>
  <acceptance_criteria>
    - Dedup logic generates strict strings.
    - HEAD requests timeout correctly.
  </acceptance_criteria>
</task>

<task id="02-04">
  <title>Implement Formatting & Persistence (formatter.ts)</title>
  <read_first>
    - src/formatter.ts
  </read_first>
  <action>
    Create `src/formatter.ts`:
    - `formatJobMarkdown(job: Job): string` properly templating the checklist `- [ ] ...` including "🔥 HIGH MATCH", "⚠️ Verify experience", etc.
    - `appendJobsToFile(filePath: string, jobs: Job[])`: append `\n` delineated strings to disk securely. 
  </action>
  <acceptance_criteria>
    - Outputs valid markdown syntax.
  </acceptance_criteria>
</task>

<task id="02-05">
  <title>Implement Tier 1 Scrapers & Main Execution Loop</title>
  <read_first>
    - src/scrapers/internshala.ts
    - src/scrapers/wellfound.ts
    - src/scrapers/remoterocketship.ts
    - src/scrapers/unstop.ts
    - src/index.ts
  </read_first>
  <action>
    - Write baseline scrapers for the 4 Tier-1 sources (can be stubbed/skeleton if fully implementing 4 simultaneously causes rate limits, but attempt standard Fetch/DOM extraction).
    - In `src/index.ts`: 
      - Wire `ora` spinner.
      - Manage an aggregation memory `Map<string, Job>` for dedup.
      - Hook up the "every 25 valid jobs -> save to job_opportunities.md" loop.
      - `console.log` structured updates.
      - Finally, output `console.table`.
  </action>
  <acceptance_criteria>
    - Program runs successfully via `bun run src/index.ts`.
  </acceptance_criteria>
</task>
```

## Verification
- `isHighMatch` tested successfully rejecting "Trust" but accepting "Rust".
- In-memory Set successfully deduplicates exact overlap records.
- Output chunks directly to markdown file.
