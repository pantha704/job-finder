---
wave: 1
depends_on: ["02"]
files_modified:
  - src/scrapers/linkedin.ts
  - src/scrapers/cutshort.ts
  - src/scrapers/himalayas.ts
  - src/index.ts
autonomous: true
---

# Plan: Tier 2 Scraping (LinkedIn, Cutshort, Himalayas)

**Objective:** Wire up the 3 Tier 2 scrapers and confirm they produce jobs through the pipeline.

## Tasks

```xml
<task id="03-01">
  <title>Cutshort Scraper</title>
  <read_first>
    - src/scrapers/cutshort.ts
  </read_first>
  <action>
    Implement fetch + cheerio scraper for cutshort.io targeting remote fresher roles in TypeScript/Rust/Web3.
    Use public job listing pages — no auth needed.
  </action>
  <acceptance_criteria>
    - cutshort.ts exports scrapeCtshort() returning Job[]
    - Registered in SCRAPERS map
  </acceptance_criteria>
</task>

<task id="03-02">
  <title>Himalayas Scraper</title>
  <read_first>
    - src/scrapers/himalayas.ts
  </read_first>
  <action>
    Himalayas has a public JSON API at https://himalayas.app/jobs/api.
    Fetch paginated results, filter for entry-level remote jobs.
  </action>
  <acceptance_criteria>
    - himalayas.ts exports scrapeHimalayas() returning Job[]
    - Uses JSON API, not scraping HTML
  </acceptance_criteria>
</task>

<task id="03-03">
  <title>LinkedIn Scraper (No-Auth)</title>
  <read_first>
    - src/scrapers/linkedin.ts
  </read_first>
  <action>
    LinkedIn public job search (no auth): use the public /jobs/search URL with keywords.
    Camoufox browser fallback if blocked.
    Skip if --linkedin-cookie not provided (pipeline already gates this).
  </action>
  <acceptance_criteria>
    - linkedin.ts gracefully skips when no cookie provided
    - Attempts fetch of public search URLs
  </acceptance_criteria>
</task>
```

## Verification
- All 3 scrapers registered in SCRAPERS map
- `bun build` passes cleanly
- At least Cutshort and Himalayas return jobs (LinkedIn may be gated)
