---
wave: 1
depends_on: ["03"]
---

# Plan: Tier 3 Web3/Rust/Solana Scraping

## Tasks

```xml
<task id="04-01">
  <title>SolanaJobs Scraper</title>
  <action>
    Fetch https://solanajobs.com with JS-rendered page (React SPA).
    Filter by seniority: entry_level + internship via URL params.
    Parse job cards: title, company, apply link, posted date.
  </action>
</task>

<task id="04-02">
  <title>CryptocurrencyJobs Scraper</title>
  <action>
    Fetch https://cryptocurrencyjobs.co/blockchain/?location=Remote with cheerio.
    Extract: title, company, location, apply URL.
    Apply experience filter (skip Senior/Lead/Staff).
  </action>
</task>

<task id="04-03">
  <title>Web3.career Scraper</title>
  <action>
    Fetch https://web3.career/remote-jobs with cheerio.
    Target table rows with job listings.
    Filter out Senior/Lead roles.
  </action>
</task>

<task id="04-04">
  <title>YCombinator (Work at a Startup) Scraper</title>
  <action>
    Use JSON API at https://www.workatastartup.com/jobs/search with filters:
    remote=true, eng_type=fs, yoe_min=0, yoe_max=2.
    Parse JSON response directly — no HTML parsing needed.
  </action>
</task>
```

## Success Criteria

1. ≥1 SolanaJobs listing in output
2. ≥1 CryptocurrencyJobs listing in output
3. All Rust/Solana jobs flagged 🔥 HIGH MATCH
4. Total unique jobs after Tier 1+2+3 ≥ 130
